import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ScheduleItem {
  id: string;
  title: string;
  address: string;
  category: "restaurant" | "hotel" | "tourist_spot";
  [key: string]: any;
}

interface ScheduleItemState {
  scheduleItems: ScheduleItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleItemState = {
  scheduleItems: [],
  loading: false,
  error: null,
};

interface FetchScheduleItemsArgs {
  category: string; // "restaurant" | "hotel" | "tourist_spot"
  location?: string;
  theme?: string;
  keyword?: string;
}

const getEndpoint = (category: string) => {
  const map: Record<string, string> = {
    restaurant: "restaurants",
    hotel: "accommodations",
    tourist_spot: "touristspots",
  };
  return map[category] || "touristspots";
};

export const fetchScheduleItems = createAsyncThunk<
  ScheduleItem[],
  FetchScheduleItemsArgs
>("scheduleItem/fetchScheduleItems", async (args, { rejectWithValue }) => {
  try {
    const { category, location, theme, keyword } = args;
    const endpoint = getEndpoint(category);

    const params = new URLSearchParams();
    if (location) params.append("regions", location);
    if (theme) params.append("themes", theme);
    if (keyword?.trim()) params.append("keyword", keyword.trim());

    params.append("page", "1");
    params.append("size", "10");
    params.append("sortType", "TITLE_ASC");

    const res = await api.get(`/places/${endpoint}`, {
      params: params,
    });

    if (!res.data.success) {
      return rejectWithValue(res.data.message || "데이터 조회 실패");
    }

    const items = res.data.data.map((item: any) => ({
      ...item,
      category: category,
    }));

    return items as ScheduleItem[];
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "요청 중 오류가 발생했습니다."
    );
  }
});

const scheduleItemSlice = createSlice({
  name: "scheduleItem",
  initialState,
  reducers: {
    clearScheduleItems: (state) => {
      state.scheduleItems = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScheduleItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleItems.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduleItems = action.payload;
      })
      .addCase(fetchScheduleItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearScheduleItems } = scheduleItemSlice.actions;
export default scheduleItemSlice.reducer;
