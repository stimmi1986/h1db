import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

export function registrationValidationMiddleware(textField: string) {
  return [
    body('name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Nafn má ekki vera tómt'),
    body('name')
      .isLength({ max: 64 })
      .withMessage('Nafn má að hámarki vera 64 stafir'),
    body('location')
      .optional()
      .isLength({ max: 256 })
      .withMessage('Staðsetning má að hámarki vera 256 stafir'),
    body('url')
      .optional()
      .isLength({ max: 256 })
      .withMessage('Slóð verður að vera gild slóð, að hámarki 256 stafir'),
    body(textField)
      .isLength({ max: 400 })
      .withMessage(
        `${
          textField === 'comment' ? 'Athugasemd' : 'Lýsing'
        } má að hámarki vera 400 stafir`
      ),
  ];
}

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware(textField:string) {
  return [
    body('name').customSanitizer((v) => xss(v)),
    body('location').customSanitizer((v) => xss(v)),
    body('url').customSanitizer((v) => xss(v)),
    body(textField).customSanitizer((v) => xss(v)),
  ];
}

export function sanitizationMiddleware(textField:string) {
  return [
    body('name').trim().escape(),
    body(textField).trim().escape(),
    body('location').trim().escape(),
    body('url').trim().escape(),
  ];
}

export async function validateUser(req: Request, res: Response, next: NextFunction) {
  const { name, username } = req.body;
  const validation = validationResult(req);

  if(!validation.isEmpty()){
    const data = {
      name,
      username,
    };
    if(!data) return res.status(400).json(validation);
  }
  return next();
}