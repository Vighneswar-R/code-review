/* eslint-disable react/display-name */
import TextInput from '../TextInput';
import { IconRupee } from '../../assets/icons';
import PropTypes from 'prop-types';
import { memo } from 'react';

export const currencyFormatter = new Intl.NumberFormat('en-In', { maximumFractionDigits: 0 });
export const currencyToFloat = (amount) =>
  parseFloat(amount?.replace('.', '').replace(',', '').replace(/\D/g, ''));

const CurrencyInput = memo(({ ...props }) => {
  let amount = currencyToFloat(props.value);

  return (
    <TextInput
      {...props}
      type='tel'
      Icon={IconRupee}
      value={isNaN(amount) ? '' : currencyFormatter.format(amount.toString())}
      onChange={(event) => {
        const value = event.currentTarget.value;
        let amount = value;
        if (value) {
          amount = currencyToFloat(event.currentTarget.value);
        }

        const modifiedEvent = Object.assign({}, event);
        modifiedEvent.target.value = amount;

        props.onChange(modifiedEvent);
      }}
    />
  );
});

CurrencyInput.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export default CurrencyInput;
