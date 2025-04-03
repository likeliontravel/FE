import { components, OptionProps } from 'react-select';

const ListOption = (props: OptionProps<any>) => {
  const { label } = props.data;

  return (
    <components.Option {...props}>
      <div>
        <div>{label}</div>
      </div>
    </components.Option>
  );
};

export default ListOption;
