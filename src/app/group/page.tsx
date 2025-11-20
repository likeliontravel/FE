"use client";

import { useEffect, useState } from "react";
import style from "../../../styles/group/groupPage.module.scss";
import NonGroup from "./nonGroup";
import IfGroup from "./ifGroup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { fetchUserGroups } from "../../../util/group/groupSlice";

const GroupPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { groups, loading } = useSelector((state: RootState) => state.group);

  useEffect(() => {
    dispatch(fetchUserGroups());
  }, [dispatch]);

  const hasGroup = groups.length > 0;

  return (
    <div className={style.body}>
      {loading ? <></> : hasGroup ? <IfGroup groups={groups} /> : <NonGroup />}
    </div>
  );
};

export default GroupPage;
