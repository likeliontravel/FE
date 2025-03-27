'use client';

import { useCallback, useMemo, useState } from 'react';
import Select from 'react-select';
import CustomOption from './CustomOption';
import CustomSingleValue from './CustomSingleValue';

const UseReactSelect = () => {
  const options = useMemo(
    () => [
      {
        value: 'trip_sokcho',
        label: '속초 여행',
        prefix: '멋사',
        suffix: 'D-21',
      },
      {
        value: 'trip_jeju',
        label: '제주도 여행',
        prefix: '가나다라',
        suffix: 'D-21',
      },
    ],
    []
  );

  const [selected, setSelected] = useState(options[0]);

  const handleChange = useCallback((v: any) => {
    if (v !== null && v !== undefined) {
      setSelected(v);
    }
  }, []);

  const customComponents = useMemo(
    () => ({
      Option: CustomOption,
      SingleValue: CustomSingleValue,
    }),
    []
  );

  return (
    <Select
      options={options} //위에서 만든 배열을 select로 넣기
      value={selected}
      onChange={handleChange}
      components={customComponents}
      //사용자가 값을 선택하지 않아도 기본 값으로 '온라인'=={online[0]}이 값으로 들어갈 수 있게
      defaultValue={options[0]}
      // 필요하다면 styles나 다른 prop도 추가
      // styles={customStyles}
    />
  );
};

export default UseReactSelect;
