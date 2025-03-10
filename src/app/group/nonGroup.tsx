import style from '../../../styles/group/groupPage.module.scss';

export default function nonGroup() {
  return (
    <div className={style.non_group}>
      <p className={style.non_group_title}>아직 그룹이 존재하지 않아요!</p>
      <p className={style.non_group_content}>
        그룹을 만들면 이곳에 그룹이 생성돼요!
      </p>
      <div className={style.non_group_div}>새로운 그룹 만들기</div>
    </div>
  );
}
