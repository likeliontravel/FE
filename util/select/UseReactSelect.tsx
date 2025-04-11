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
import {
  setSelectedCalendarSchedule,
  setSelectedListSchedule,
  ScheduleOption,
} from '../../store/calendarSlice';

interface UseReactSelectProps {
  type: 'calendar' | 'list';
}

const UseReactSelect = ({ type }: UseReactSelectProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedCalendarSchedule = useSelector(
    (state: RootState) => state.calendar.selectedCalendarSchedule
  );
  const selectedListSchedule = useSelector(
    (state: RootState) => state.calendar.selectedListSchedule
  );

  const calendarOptions = useMemo(() => {
    return [
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
    ];
  }, []);

  const listOptions = useMemo(() => {
    return [
      { value: 'restaurant', label: '맛집' },
      { value: 'hotel', label: '숙소' },
      { value: 'tourist_spot', label: '관광지' },
    ];
  }, []);

  const { options, customComponents, currentValue, onChangeAction } =
    useMemo(() => {
      if (type === 'calendar') {
        return {
          options: calendarOptions,
          customComponents: {
            Option: CalendarOption,
            SingleValue: CalendarSingleValue,
          },
          currentValue: selectedCalendarSchedule, // 캘린더 Select의 현재값
          onChangeAction: setSelectedCalendarSchedule, // 액션
        };
      } else {
        return {
          options: listOptions,
          customComponents: {
            Option: ListOption,
            SingleValue: ListSingleValue,
          },
          currentValue: selectedListSchedule, // 리스트 Select의 현재값
          onChangeAction: setSelectedListSchedule, // 액션
        };
      }
    }, [
      type,
      selectedCalendarSchedule,
      selectedListSchedule,
      calendarOptions,
      listOptions,
    ]);

  const handleChange = useCallback(
    (
      newValue: SingleValue<ScheduleOption>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _actionMeta: ActionMeta<ScheduleOption>
    ) => {
      if (newValue !== null && newValue !== undefined) {
        dispatch(onChangeAction(newValue));
      }
    },
    [dispatch, onChangeAction]
  );

  const filterOptions = useCallback(
    (option: any) =>
      option.data.value !== 'default' &&
      option.data.value !== currentValue.value,
    [currentValue]
  );

  const instanceId = type === 'calendar' ? 'calendar-select' : 'list-select';

  return (
    <Select<ScheduleOption, false>
      instanceId={instanceId}
      classNamePrefix={
        type === 'calendar' ? 'custom-select-calendar' : 'custom-select-list'
      }
      options={options}
      value={currentValue}
      onChange={handleChange}
      components={customComponents}
      defaultValue={options[0]}
      isSearchable={false}
      filterOption={filterOptions}
    />
  );
};

export default UseReactSelect;
