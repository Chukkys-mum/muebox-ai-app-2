// components/chatwidget/styles.ts

export const chatStyles = {
  message: {
    user: 'bg-blue-500 text-white rounded-[20px] p-4 mb-3 ml-auto max-w-[80%] shadow-sm',
    bot: 'bg-gray-100 text-gray-900 rounded-[20px] p-4 mb-3 mr-auto max-w-[80%] shadow-sm'
  },
  container: {
    base: 'fixed bottom-6 right-5 z-[1045] transition-all duration-300 ease-out',
    messages: 'flex flex-col p-6 overflow-y-auto h-[552px]' // 34.5rem = 552px
  },
  header: {
    base: 'flex items-center justify-between p-4 border-b border-gray-100',
    title: 'flex items-center gap-2',
    titleText: 'text-lg font-medium',
    close: 'hover:bg-gray-100 rounded-full p-2 transition-colors',
    status: 'w-2 h-2 rounded-full bg-green-500'
  },
  input: {
    container: 'p-4 border-t border-gray-100',
    wrapper: 'flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2',
    field: 'flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-500',
    actions: 'flex items-center gap-2',
    button: 'w-[37px] h-[37px] flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors'
  },
  window: {
    base: 'bg-white rounded-[20px] shadow-lg w-[446px] transform scale-0 opacity-0 origin-bottom-right transition-all duration-300 ease-out',
    open: 'scale-100 opacity-100',
    card: 'overflow-hidden'
  },
  pill: {
    base: 'flex items-center justify-center w-36 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 gap-2',
    close: 'w-12 rounded-full',
    icon: 'w-4 h-4'
  }
} as const;