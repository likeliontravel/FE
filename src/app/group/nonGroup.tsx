import style from '../../../styles/group/groupPage.module.scss';

const nonGroup = () => {
  return (
    <>
      {/* 그룹 */}
      <div className={style.non_group}>
        <p className={style.non_group_title}>아직 그룹이 존재하지 않아요!</p>
        <p className={style.non_group_content}>
          그룹을 만들면 이곳에 그룹이 생성돼요!
        </p>
        <div className={style.non_group_div}>새로운 그룹 만들기</div>
      </div>
      {/* 일정 */}
      <div className={style.non_schedule_div}>
        <div className={style.non_comming_div}>
          <p>새로운 여정을</p>
          <p>투리브에서</p>
          <p>시작해볼까요?</p>
        </div>
        {/* 그룹 메인 이미지 */}
        <div className={style.schedule_div_group_img}></div>
      </div>
    </>
  );
};

export default nonGroup;
