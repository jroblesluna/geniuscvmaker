import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid URL' });
    }

    // Descargar el HTML de la página
    const { data } = await axios.get(url);

    if (!data) {
      return res.status(500).json({ error: 'No HTML content received' });
    }

    // Cargar el HTML en Cheerio
    const $ = cheerio.load(data);

    // Requiriments :
    // section:nth-child(1) section:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) p, section section:nth-child(1) div div div ul li
    // Company Data and requirements
    //ul.description__job-criteria-list li h3, ul.description__job-criteria-list li span
    // Information complete - Resume
    //html body main section:nth-child(1) div div section div div section div

    const sentence: string[] = [];

    const unwantedTexts = [
      'or',
      'New to LinkedIn? Join now',
      'By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy.',
      'Password Show',
      'Show',
      'Forgot password? Sign in',
      'You may also apply directly on company website.',
      'By clicking Agree & Join, you agree to the LinkedIn User Agreement, Privacy Policy and Cookie Policy.',
      'Email',
      'Email Password (6+ characters)',
      'Password (6+ characters)',
      'Email or phone',
      'First name',
      'First name Last name',
      'Last name',
      'Email or phone Password Show',
      'Security verification',
      'Sign in Welcome back Email or phone Password Show Forgot password? Sign in or By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy. New to LinkedIn? Join now',
      'Welcome back Email or phone Password Show Forgot password? Sign in or By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy. New to LinkedIn? Join now',
      'Sign in to evaluate your skills Sign in Welcome back Email or phone Password Show Forgot password? Sign in or By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy. New to LinkedIn? Join now or New to LinkedIn? Join now By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy.',
      'Sign in to tailor your resume Sign in Welcome back Email or phone Password Show Forgot password? Sign in or By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy. New to LinkedIn? Join now or New to LinkedIn? Join now By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy.',
      'Sign in Welcome back Email or phone Password Show Forgot password? Sign in or By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy. New to LinkedIn? Join now or',
      'Sign in to access AI-powered advices Sign in Welcome back Email or phone Password Show Forgot password? Sign in or By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy. New to LinkedIn? Join now or New to LinkedIn? Join now By clicking Continue to join or sign in, you agree to LinkedIn’s User Agreement, Privacy Policy, and Cookie Policy.',
    ];

    sentence.push('RESUME: ');

    $(' html body main section:nth-child(1) div div section div div section div  ').each(
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
      '  section:nth-child(1) section:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) p, section section:nth-child(1) div div div ul li, html body main section:nth-child(1) div div section div div section div strong'
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
    $(' ul.description__job-criteria-list li ').each((_, element) => {
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
    const titles = sentence.join('\n');
    console.log(titles);

    res.status(200).json({ titles });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape the website' });
  }
}
