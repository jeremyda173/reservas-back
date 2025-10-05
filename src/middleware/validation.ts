import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints)[0] : 'Error de validación';
        });

        return res.status(400).json({
          message: 'Error de validación',
          errors: errorMessages
        });
      }

      req.body = dto;
      next();
    } catch (error) {
      res.status(500).json({
        message: 'Error en la validación',
        error: error instanceof Error ? error.message : error
      });
    }
  };
}
