import { components, SingleValueProps } from "react-select";
import style from "./Select.module.scss";
import { ScheduleOption } from "../../util/schedule/scheduleSlice";

const CalendarSingleValue = (
  props: SingleValueProps<ScheduleOption, false>,
) => {
  const { value, label, dDay } = props.data;

  return (
    <components.SingleValue {...props}>
      <div className={style.show_custom_div}>
        {value !== "default" && (
          <span className={style.show_prefix}>[{value}]</span>
        )}
        <span className={style.show_label}>{label}</span>
        {value !== "default" && (
          <span className={style.show_suffix}>{dDay}</span>
        )}
      </div>
    </components.SingleValue>
  );
};

export default CalendarSingleValue;
