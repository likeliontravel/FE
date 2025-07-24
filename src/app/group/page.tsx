"use client";

import { useEffect, useState } from "react";
import style from "../../../styles/group/groupPage.module.scss";
import NonGroup from "./nonGroup";
import IfGroup from "./ifGroup";

const GroupPage = () => {
  const token = localStorage.getItem("accessToken");
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("https://localhost:8080/group/user-groups", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGroups(json.data);
          setHasGroup(true);
        } else {
          setHasGroup(false);
        }
      } catch (error) {
        console.error("그룹 정보 불러오기 실패:", error);
        setHasGroup(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className={style.body}>
      {hasGroup ? <IfGroup groups={groups} /> : <NonGroup />}
    </div>
  );
};

export default GroupPage;
