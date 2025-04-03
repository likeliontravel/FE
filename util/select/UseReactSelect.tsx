'use client';

import { useCallback, useMemo, useState } from 'react';
import Select from 'react-select';
import CalendarOption from './CalendarOption';
import ListOption from './ListOption';
import CalendarSingleValue from './CalendarSingleValue';
import ListSingleValue from './ListSingleValue';
import './Select.module.scss';

interface UseReactSelectProps {
  type: 'calendar' | 'list';
}

const UseReactSelect = ({ type }: UseReactSelectProps) => {
  const { options, customComponents } = useMemo(() => {
    if (type === 'calendar') {
      return {
        options: [
          { value: 'default', label: '-', prefix: '내일정', suffix: 'D-' },
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
        customComponents: {
          Option: CalendarOption,
          SingleValue: CalendarSingleValue,
        },
      };
    } else {
      return {
        options: [
          { value: 'restaurant', label: '맛집' },
          { value: 'hotel', label: '숙소' },
          { value: 'tourist_spot', label: '관광지' },
        ],
        customComponents: {
          Option: ListOption,
          SingleValue: ListSingleValue,
        },
      };
    }
  }, [type]);

  const [selected, setSelected] = useState(options[0]);

  const handleChange = useCallback((v: any) => {
    if (v !== null && v !== undefined) {
      setSelected(v);
    }
  }, []);

  const filterOptions = useCallback(
    (option: any) =>
      option.data.value !== 'default' && option.data.value !== selected.value,
    [selected]
  );

  return (
    <Select
      classNamePrefix={
        type === 'calendar' ? 'custom-select-calendar' : 'custom-select-list'
      }
      options={options}
      value={selected}
      onChange={handleChange}
      components={customComponents}
      defaultValue={options[0]}
      isSearchable={false}
      filterOption={filterOptions}
    />
  );
};

export default UseReactSelect;
