export const Button = () => {
  return (
    <button
      className="
  bg-pink-300             /* 基礎背景色：珊瑚粉 */
  text-gray-800           /* 圖標顏色：深暖灰 */
  p-3                     /* 內邊距：四邊相同，讓按鈕變圓 */
  rounded-full            /* 邊角：極致圓潤 */
  shadow-md               /* 陰影 */
  hover:bg-pink-400       /* 懸停背景 */
  hover:shadow-lg         /* 懸停陰影 */
  transition-all          /* 過渡效果 */
  duration-200            /* 過渡時長 */
  ease-in-out             /* 過渡曲線 */
  focus:outline-none
  focus:ring-2
  focus:ring-pink-300
  focus:ring-opacity-75
  active:bg-pink-500
  active:shadow-inner
  inline-flex items-center justify-center /* 確保內部圖標居中 */
  w-12 h-12               /* 固定寬高，確保按鈕是個正圓 */
">
      {/* <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clip-rule="evenodd"
        />
      </svg> */}
      Lovely Button
    </button>
  )
}
