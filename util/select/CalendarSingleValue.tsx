import { components, SingleValueProps } from 'react-select';
import style from './Select.module.scss';

const CalendarSingleValue = (props: SingleValueProps<any>) => {
  const { prefix, suffix, label } = props.data;

  return (
    <components.SingleValue {...props}>
      <div className={style.show_custom_div}>
        <span className={style.show_prefix}>{prefix}</span>
        <span className={style.show_label}>{label}</span>
        <span className={style.show_suffix}>{suffix}</span>
      </div>
    </components.SingleValue>
  );
};

export default CalendarSingleValue;
