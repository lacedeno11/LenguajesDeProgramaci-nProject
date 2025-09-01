#!/usr/bin/env node

/**
 * Script para probar el logout en la aplicación web real
 * Usa puppeteer para automatizar la interacción con el navegador
 */

const puppeteer = require('puppeteer');

async function testWebLogout() {
  console.log('🌐 === Testing Web Logout ===\n');
  
  let browser;
  let page;
  
  try {
    // Lanzar navegador
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Mantener visible para debug
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Escuchar logs de la consola del navegador
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (text.includes('🚪') || text.includes('🗑️') || text.includes('✅') || text.includes('❌')) {
        console.log(`🌐 Browser Console [${type}]:`, text);
      }
    });
    
    // Navegar a la aplicación
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:8082', { waitUntil: 'networkidle2' });
    
    // Esperar a que la app cargue
    await page.waitForTimeout(3000);
    
    // Verificar si ya está logueado o necesita login
    console.log('🔍 Checking auth state...');
    
    // Buscar el botón de logout para ver si ya está logueado
    let logoutButton = await page.$('text=🚪 Salir v2');
    
    if (!logoutButton) {
      console.log('🔐 Not logged in, attempting login...');
      
      // Buscar campos de login
      const emailField = await page.$('input[type="email"], input[placeholder*="email" i]');
      const passwordField = await page.$('input[type="password"], input[placeholder*="password" i]');
      const loginButton = await page.$('text=Iniciar Sesión, text=Login, button[type="submit"]');
      
      if (emailField && passwordField && loginButton) {
        await emailField.type('test@example.com');
        await passwordField.type('password');
        await loginButton.click();
        
        console.log('⏳ Waiting for login to complete...');
        await page.waitForTimeout(2000);
        
        // Buscar el botón de logout nuevamente
        logoutButton = await page.$('text=🚪 Salir v2');
      }
    }
    
    if (!logoutButton) {
      console.error('❌ Could not find logout button. App might not be loaded correctly.');
      await page.screenshot({ path: 'debug-no-logout-button.png' });
      return;
    }
    
    console.log('✅ Found logout button, testing logout...');
    
    // Hacer click en el botón de logout
    await logoutButton.click();
    
    console.log('⏳ Waiting for logout confirmation dialog...');
    await page.waitForTimeout(1000);
    
    // Buscar el botón de confirmación en el Alert
    // En React Native Web, los Alerts se renderizan como modales
    const confirmButton = await page.$('text=Cerrar Sesión');
    
    if (confirmButton) {
      console.log('✅ Found confirmation dialog, confirming logout...');
      await confirmButton.click();
      
      console.log('⏳ Waiting for logout to complete...');
      await page.waitForTimeout(3000);
      
      // Verificar si regresamos a la pantalla de login
      const loginForm = await page.$('input[type="email"], input[placeholder*="email" i]');
      
      if (loginForm) {
        console.log('🎉 SUCCESS: Logout worked! Redirected to login screen.');
      } else {
        console.log('❌ FAILURE: Still on main screen after logout.');
        await page.screenshot({ path: 'debug-logout-failed.png' });
      }
    } else {
      console.log('❌ Could not find confirmation dialog');
      await page.screenshot({ path: 'debug-no-confirmation.png' });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (page) {
      await page.screenshot({ path: 'debug-error.png' });
    }
  } finally {
    if (browser) {
      // Esperar un poco antes de cerrar para ver el resultado
      await new Promise(resolve => setTimeout(resolve, 5000));
      await browser.close();
    }
  }
}

// Ejecutar el test
testWebLogout();
