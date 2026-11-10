import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';
export async function withStudio(callback){
 const server=await createServer({server:{host:'127.0.0.1',port:5180,strictPort:true},base:'/'});
 let browser;
 try{
  await server.listen();
  browser=await chromium.launch(launchOptions);
  const page=await browser.newPage({viewport:{width:900,height:1000}});
  page.on('pageerror',error=>console.error(error.message));
  await page.goto('http://127.0.0.1:5180/scripts/asset-studio.html');
  await page.waitForFunction(()=>typeof window.exportModel==='function');
  await callback(page);
 }finally{await browser?.close();await server.close();}
}
