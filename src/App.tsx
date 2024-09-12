/// <reference types="vite-plugin-svgr/client" />
import './tailwind.css'
import AutoComplete from './components/AutoComplete'

function App() {


  return (
    <>
      <div className='bg-gray-100 flex items-center justify-center w-screen h-screen p-6 text-[24px]'>
        <div className='bg-white rounded-md max-w-md p-6 shadow-sm'>
          <div className='flex flex-col items-center justify-center space-y-6'>
            <div className='flex flex-col items-start overflow-visible text-left w-full'>
              <label className='text-sm text-gray-500'>Async Search</label>
              <div className='relative w-full'>
                <AutoComplete asyncSearch={true} />
                <p className='mt-2 text-sm text-gray-500'>With description and custom results display</p>
              </div>
            </div>
            <div className='flex flex-col items-start overflow-visible text-left w-full'>
              <label className='text-sm text-gray-500'>Sync Search</label>
              <div className='relative w-full'>
              <AutoComplete asyncSearch={false} />
                <p className='mt-2 text-sm text-gray-500'>With default display and search on focus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
