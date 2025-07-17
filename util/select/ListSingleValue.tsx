import { components, SingleValueProps } from 'react-select';
import style from './Select.module.scss';

const ListSingleValue = (props: SingleValueProps<any>) => {
  const { label } = props.data;

  return (
    <components.SingleValue {...props}>
      <div className={style.show_list_div}>
        <span className={style.show_list_label}>{label}</span>
      </div>
    </components.SingleValue>
  );
};

export default ListSingleValue;
