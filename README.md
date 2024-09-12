# Auto Complete Feature

`disabled` is replaced with `open` to check the state of the dropbox to be open or close.

`renderOption` logic was not included as a prop, instead it was replace as a prop called `asyncSearch` to determine if the AutoComplete component is Async Search or Sync Search. 

Rendering option logic is factored in `onInputChange`.

Included props such as `searchResults` to indicate as the filtered options based on the input value, and `checkedItems` to see which checkboxes have been checked to maintain state of checked checkboxes.

## Deployment Website

This is the link for feature: https://auto-complete-feature-yong-quan.vercel.app/