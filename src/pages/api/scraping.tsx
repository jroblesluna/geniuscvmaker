import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

const userAgents = [
  // Google Chrome (Windows, Mac, Linux)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',

  // Mozilla Firefox (Windows, Mac, Linux)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:118.0) Gecko/20100101 Firefox/118.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0',

  // Microsoft Edge (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',

  // Safari (Mac y iPhone)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/537.36',

  // Android (Chrome y Samsung Browser)
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
];

// Selecciona uno aleatorio

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid URL' });
    }

    // Delay random between 1s y 2s to avoid being blocked
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 1000));

    // select random User-Agent
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const headers = {
      'User-Agent': randomUserAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.google.com/',
    };

    const { data } = await axios.get(url, { headers });
    if (!data) {
      throw new Error('No HTML content received');
    }

    const $ = cheerio.load(data);
    $('.modal__overlay').each((_, element) => {
      $(element).remove(); // // Remove each element with the modal overlay class
    });

    const sentence: string[] = [];
    // delete if don't not neded
    const unwantedTexts = [
      'or',
      // 'o',
      // 'New to LinkedIn? Join now',
      // '¿Nuevo en LinkedIn? Únete ahora',
      // 'By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy.',
      // 'Al hacer clic en Continuar para unirte o iniciar sesión, aceptas el Acuerdo de Usuario, la Política de Privacidad y la Política de Cookies de LinkedIn.',
      // 'Password Show',
      // 'Mostrar contraseña',
      // 'Show',
      // 'Mostrar',
      // 'Forgot password? Sign in',
      // '¿Olvidaste tu contraseña? Inicia sesión',
      // 'You may also apply directly on company website.',
      // 'También puedes postularte directamente en el sitio web de la empresa.',
      // 'By clicking Agree & Join, you agree to the LinkedIn User Agreement, Privacy Policy and Cookie Policy.',
      // 'Al hacer clic en Aceptar y Unirse, aceptas el Acuerdo de Usuario, la Política de Privacidad y la Política de Cookies de LinkedIn.',
      // 'Email',
      // 'Correo electrónico',
      // 'Email Password (6+ characters)',
      // 'Correo electrónico Contraseña (más de 6 caracteres)',
      // 'Password (6+ characters)',
      // 'Contraseña (más de 6 caracteres)',
      // 'Email or phone',
      // 'Correo electrónico o teléfono',
      // 'First name',
      // 'Nombre',
      // 'First name Last name',
      // 'Nombre y apellido',
      // 'Last name',
      // 'Apellido',
      // 'Security verification',
      // 'Verificación de seguridad',
      // 'Sign in',
      // 'Iniciar sesión',
      // 'Join now',
      // 'Únete ahora',
      // 'Create an account',
      // 'Crear una cuenta',
      // 'Continue',
      // 'Continuar',
      // 'Agree & Join',
      // 'Aceptar y Unirse',
      // 'Verification required',
      // 'Se requiere verificación',
      // 'Enter the code',
      // 'Ingresa el código',
      // 'Didn’t receive a code?',
      // '¿No recibiste un código?',
      // 'Resend code',
      // 'Reenviar código',
      // 'Next',
      // 'Siguiente',
      // 'Back',
      // 'Atrás',
      // 'Cancel',
      // 'Cancelar',
      // 'Submit',
      // 'Enviar',
      // 'Sign out',
      // 'Cerrar sesión',
      // 'Terms of Service',
      // 'Términos de servicio',
      // 'Privacy Policy',
      // 'Política de privacidad',
      // 'Cookie Policy',
      // 'Política de cookies',
      // 'Need help?',
      // '¿Necesitas ayuda?',
      // 'Continue with Google',
      // 'Continuar con Google',
      // 'Continue with Apple',
      // 'Continuar con Apple',
      // 'Continue with Facebook',
      // 'Continuar con Facebook',
      // 'Remember me',
      // 'Recuérdame',
      // 'Keep me signed in',
      // 'Mantenerme conectado',
      // 'Trouble signing in?',
      // '¿Problemas para iniciar sesión?',
      // 'Let’s get started',
      // 'Empecemos',
      // 'Apellidos',
      // '¡Hola de nuevo! Email o teléfono Contraseña Mostrar ¿Has olvidado tu contraseña? Inicia sesión o Al hacer clic en «Continuar» para unirte o iniciar sesión, aceptas las Condiciones de uso, la Política de privacidad y la Política de cookies de LinkedIn. ¿Estás empezando a usar LinkedIn? Únete ahora',
      // 'Nombre Apellidos',
      // 'Apellidos Apellidos',
      // 'Email o teléfono',
      // 'Contraseña Mostrar',
      // '¿Has olvidado tu contraseña? Inicia sesión',
      // 'Email Contraseña (más de 6 caracteres)',
      // 'Nombre Apellidos Email Contraseña (más de 6 caracteres)',
      // 'Nombre Apellidos Apellidos Email Contraseña (más de 6 caracteres)',
      // 'Al hacer clic en «Aceptar y unirse», aceptas las Condiciones de uso, la Política de privacidad y la Política de cookies de LinkedIn.',
      // '. o o',
    ];

    $('html body main section:nth-child(1) div div section div div section div').each(
      (_, element) => {
        const text_content = $(element).text().trim().replace(/\s+/g, ' ').trim();

        if (
          text_content.length > 0 &&
          !unwantedTexts.includes(text_content) &&
          !text_content.includes(' User Agreement, Privacy Policy, and Cookie Policy.')
        ) {
          sentence.push(text_content);
        }
      }
    );

    sentence.push('GENERAL RESPONSIBILITIES AND JOB REQUIREMENTS: ');

    $(
      'section:nth-child(1) section:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) p, section section:nth-child(1) div div div ul li, html body main section:nth-child(1) div div section div div section div strong'
    ).each((_, element) => {
      const text_content = $(element).text().trim().replace(/\s+/g, ' ').trim();

      if (
        text_content.length > 0 &&
        !unwantedTexts.includes(text_content) &&
        !text_content.includes(' User Agreement, Privacy Policy, and Cookie Policy.')
      ) {
        sentence.push(text_content);
      }
    });

    sentence.push('ADDITIONAL JOB DETAILS: ');
    $('ul.description__job-criteria-list li').each((_, element) => {
      const text_content = $(element).text().trim().replace(/\s+/g, ' ').trim();

      if (
        text_content.includes('Seniority level') ||
        text_content.includes('Employment ') ||
        text_content.includes('Job function ') ||
        text_content.includes('Industries :')
      ) {
        const replacements: Record<string, string> = {
          'Seniority level': 'Seniority level: ',
          Employment: 'Employment : ',
          'Job function': 'Job function : ',
          Industries: 'Industries : ',
        };

        sentence.push(
          text_content.replace(
            /Seniority level|Employment|Industries|Job function/,
            (match) => replacements[match]
          )
        );
      } else {
        sentence.push(text_content);
      }
    });

    res.status(200).json({ content: sentence.join('\n') });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape the website' });
  }
}
