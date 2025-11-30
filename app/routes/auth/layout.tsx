import React from 'react'
import { Link, Outlet } from 'react-router'

export default function layout() {
  return (
    <div>
        <h1>this is layout</h1>
        <nav>
            <Link to = "/login">Login</Link>
            <Link to = "/register">Register</Link>
        </nav>
        <div>
            <Outlet/>
        </div>
    </div>
  )
}
