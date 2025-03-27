import { useMemo } from 'react';
import { components, SingleValueProps } from 'react-select';

const CustomSingleValue = (props: SingleValueProps<any>) => {
  const { prefix, suffix, label } = props.data;

  const containerStyle = useMemo(
    () => ({ display: 'flex', alignItems: 'center' }),
    []
  );
  const leftBadgeStyle = useMemo(
    () => ({
      backgroundColor: '#38BDF8',
      color: '#fff',
      padding: '2px 6px',
      borderRadius: '4px',
      marginRight: '8px',
      fontSize: '0.8rem',
    }),
    []
  );

  const labelStyle = useMemo(() => ({ flex: 1 }), []);
  const suffixStyle = useMemo(
    () => ({ color: 'gray', fontSize: '0.8rem' }),
    []
  );
  return (
    <components.SingleValue {...props}>
      <div style={containerStyle}>
        {/* 왼쪽 배지 */}
        <span style={leftBadgeStyle}>{prefix}</span>
        {/* 가운데 라벨 */}
        <span style={labelStyle}>{label}</span>
        {/* 오른쪽 suffix */}
        <span style={suffixStyle}>{suffix}</span>
      </div>
    </components.SingleValue>
  );
};

export default CustomSingleValue;
