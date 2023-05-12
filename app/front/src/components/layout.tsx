import Head from 'next/head';
import Image from 'next/image';
import utilStyles from '../styles/utils.module.css';

import Navbar from './navbar'

export default function Layout({ children }) {
  return (
    <>
	    <Navbar/>
      	<main>{children}</main>
    </>
  )
}
