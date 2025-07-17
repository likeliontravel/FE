import { components, OptionProps } from 'react-select';
import style from './Select.module.scss';

const CalendarOption = (props: OptionProps<any>) => {
  const { prefix, suffix, label } = props.data;

  return (
    <components.Option {...props}>
      <div className={style.custom_div}>
        <div className={style.prefix_div}>
          <div className={style.prefix}>{prefix}</div>
        </div>
        <div className={style.label}>{label}</div>
        <div className={style.suffix}>{suffix}</div>
      </div>
    </components.Option>
  );
};

export default CalendarOption;
