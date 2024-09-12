import "../tailwind.css";
import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  autoUpdate,
  size,
  useId,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import options from "../options";
import SearchIcon from "../assets/search.svg?react";
import Spinner from "../assets/spinner.svg?react";

// Define the props for the Item component
interface ItemProps {
  value: string;
  active: boolean;
  checked: boolean;
  onCheckChange: (value: string, checked: boolean) => void;
}

// Item component for rendering individual search results
const Item = forwardRef<
  HTMLInputElement,
  ItemProps & React.HTMLProps<HTMLDivElement>
>(({ value, active, checked, onCheckChange, ...rest }, ref) => {
  const id = useId();

  // Memoize the change handler to prevent unnecessary re-renders
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckChange(value, event.target.checked);
    },
    [onCheckChange, value]
  );


  return (
    <label className={`flex items-center justify-between px-4 py-2 text-sm leading-5 cursor-pointer focus:outline-none text-gray-600 hover:bg-blue-100 transition-colors duration-150 ${active ? 'bg-blue-100 odd:bg-blue-100' : 'bg-white odd:bg-gray-50'}`}>
      {value}
      <input
        ref={ref}
        type="checkbox"
        role="option"
        id={id}
        aria-selected={active}
        checked={checked}
        onChange={onChange}
        className='outline-none'
        {...rest}
      />
    </label>
  );
});

// Async search function that matches the query
function asyncSearchMatchingQuery(query: string) {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve(
        options.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      );
    }, 1000);
  });
}

interface AutoCompleteProps {
  asyncSearch: boolean;
  multiple: boolean;
}

function AutoComplete({ asyncSearch, multiple }: AutoCompleteProps) {
  // State management variables
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const listRef = useRef<Array<HTMLElement | null>>([]);

  // Floating UI variables
  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  // Set up interactions for the floating UI
  const role = useRole(context, { role: "listbox" });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav]
  );

  // Handle input changes based on text
  const onInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);

      if (asyncSearch) {
        setIsLoading(true);
        try {
          const results = await asyncSearchMatchingQuery(value);
          if (value.length > 0) {
            setSearchResults(results);
          } else {
            setSearchResults([]);
          }
          setOpen(true);
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setOpen(true);
      }
    },
    [asyncSearch]
  );


  // Handle Checkbox Changes
  const handleCheckChange = useCallback((value: string, checked: boolean) => {
    if (multiple) {
      setCheckedItems((prev) => ({ ...prev, [value]: checked }));
    } else {
      setCheckedItems({ [value]: checked });
    }
  }, []);

  // Handle Keyboard Events
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValue = searchResults[activeIndex ?? -1];
      if (currentValue) {
        if (multiple) {
          setCheckedItems((prev) => ({ ...prev, [currentValue]: !prev[currentValue] }));
        } else {
          setCheckedItems({ [currentValue]: true });
        }
      }
    }
  }, [activeIndex, searchResults]);

  // Filter data for sync search
  const filteredOptions = useMemo(() => {
    if (inputValue.length === 0) return [];
    return options.filter((item) =>
      item.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue]);

  // Update search results for sync search
  useEffect(() => {
    if (!asyncSearch) {
      setSearchResults(filteredOptions);
    }
  }, [filteredOptions, asyncSearch]);

  return (
    <>
      {/* Search icon */}
      <SearchIcon className="absolute top-1 ml-[4px] mt-[8px] left-0 w-6 h-6 z-10" />
      {/* Input field */}
      <input
        {...getReferenceProps({
          ref: refs.setReference,
          onChange: onInputChange,
          value: inputValue,
          placeholder: "Type to begin searching",
          className:
            "relative mt-1 block w-full pl-10 form-input border-gray-200 sm:text-sm sm:leading-5 rounded-md shadow-sm h-[42px]",
          "aria-autocomplete": "list",
        })}
      />
      {/* Loading spinner */}
      {isLoading && (
        <Spinner className="absolute top-1 mr-[8px] mt-[8px] right-0" />
      )}
      {/* Dropdown menu */}
      <FloatingPortal>
        {open && (
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <div
              ref={refs.setFloating}
              {...getFloatingProps({
                style: {
                  ...floatingStyles,
                  background: "#eee",
                  color: "black",
                  overflowY: "auto",
                  zIndex: 20,
                },
              })}
            >
              {searchResults.length > 0 ? (
                searchResults.map((currency, index) => {
                  const itemProps = getItemProps({
                    ref(node) {
                      listRef.current[index] = node;
                    },
                  });
                  return (
                    <Item
                      key={currency}
                      {...itemProps}
                      value={currency}
                      active={activeIndex === index}
                      checked={checkedItems[currency] || false}
                      onCheckChange={handleCheckChange}
                      onKeyDown={handleKeyDown}
                    />
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
}

export default AutoComplete;
