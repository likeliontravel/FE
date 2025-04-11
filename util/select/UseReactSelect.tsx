'use client';

import { useCallback, useMemo } from 'react';
import Select, { SingleValue, ActionMeta } from 'react-select';
import CalendarOption from './CalendarOption';
import ListOption from './ListOption';
import CalendarSingleValue from './CalendarSingleValue';
import ListSingleValue from './ListSingleValue';
import './Select.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setSelectedSchedule, ScheduleOption } from '../../store/calendarSlice';

interface UseReactSelectProps {
  type: 'calendar' | 'list';
}

const UseReactSelect = ({ type }: UseReactSelectProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedSchedule = useSelector(
    (state: RootState) => state.calendar.selectedSchedule
  );

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

  const handleChange = useCallback(
    (
      newValue: SingleValue<ScheduleOption>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _actionMeta: ActionMeta<ScheduleOption>
    ) => {
      if (newValue !== null && newValue !== undefined) {
        dispatch(setSelectedSchedule(newValue));
      }
    },
    [dispatch]
  );

  const filterOptions = useCallback(
    (option: any) =>
      option.data.value !== 'default' &&
      option.data.value !== selectedSchedule.value,
    [selectedSchedule]
  );

  return (
    <Select<ScheduleOption, false>
      classNamePrefix={
        type === 'calendar' ? 'custom-select-calendar' : 'custom-select-list'
      }
      options={options}
      value={type === 'calendar' ? selectedSchedule : options[0]}
      onChange={handleChange}
      components={customComponents}
      defaultValue={options[0]}
      isSearchable={false}
      filterOption={filterOptions}
    />
  );
};

export default UseReactSelect;
