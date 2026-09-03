import { components, OptionProps } from "react-select";
import style from "./Select.module.scss";
import { ScheduleOption } from "../../util/schedule/scheduleSlice";

const CalendarOption = (props: OptionProps<ScheduleOption, false>) => {
  const { value, label, dDay } = props.data;

  return (
    <components.Option {...props}>
      <div className={style.custom_div}>
        <div className={style.prefix_div}>
          <div className={style.prefix}>{value}</div>
        </div>
        <div className={style.label}>{label}</div>
        {value !== "default" && <div className={style.suffix}>{dDay}</div>}
      </div>
    </components.Option>
  );
};

export default CalendarOption;
