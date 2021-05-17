/**
 * @class ValidateLoan
 * @description Intercepts and validates a given request for Loan endpoints
 * @exports ValidateLoan
 */
export default class ValidateLoan {
  /**
   * @method validateLoanApply
   * @description
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @returns
   */
  static validateLoanApply(req, res, next) {
    req
      .checkBody('amount').notEmpty()
      .withMessage('Enter amount')
      .trim()
      .isNumeric()
      .withMessage('Amount should be an integer')
      .isLength({ min: 5, max: 7 })
      .withMessage('Amount should not be less than 10,000');
    req
      .checkBody('tenor').notEmpty()
      .withMessage('Tenor is required')
      .trim()
      .isNumeric()
      .withMessage('Tenor should be an integer')
      .isInt({ min: 1, max: 12 })
      .withMessage('Loan tenor must be between 1 and 12 months');

    const errors = req.validationErrors();
    if (errors) {
      res.status(400).json({ status: 400, error: errors[0].msg });
      return;
    }
    next();
  }

  /**
   * @method validateQueryOptions
   * @description
   * @param {object} req - The Request Object
   * @param {object} res - The Response Object
   * @returns
   */
  static validateQueryOptions(req, res, next) {
    req.checkQuery('status').optional().isAlpha()
      .withMessage('Invalid status entered!')
      .matches(/^(approved|rejected|pending)$/)
      .withMessage('Invalid status option specified!');
    req.checkQuery('repaid').optional().isAlpha()
      .withMessage('Invalid repaid entered!')
      .matches(/^(true|t|false|f)$/)
      .withMessage('Invalid repaid option specified');

    const errors = req.validationErrors();
    if (errors) {
      res.status(400).json({ status: 400, error: errors[0].msg });
      return;
    }
    next();
  }
}
