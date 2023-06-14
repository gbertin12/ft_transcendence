import Head from 'next/head';
import Image from 'next/image';
import utilStyles from '../styles/utils.module.css';

import {TranscendenceNavbar} from './navbar'

export default function Layout({ children }) {
  return (
    <>
	    <TranscendenceNavbar/>
      	<main>{children}</main>
    </>
  )
}
