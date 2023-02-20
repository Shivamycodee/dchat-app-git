import React from 'react'
import Navbar from './navbar'

function layout({children}) {
  return (
    <>
    <Navbar/>
    {children}
    </>
  )
}

export default layout