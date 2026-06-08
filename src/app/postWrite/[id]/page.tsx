'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { 
  createBoard, 
  updateBoard, 
  uploadImage, 
  clearBoardLoading,
  fetchBoardDetail 
} from '../../../../util/board/boardSilce';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Image as ImageExtension } from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'; 
import Heading from '@tiptap/extension-heading';

import styles from '../../../../styles/postWrite/postWrite.module.scss';
import SearchBar from '../../SearchBar/SearchBar'; 
import MapModal from '../MapModal';

const regionKeywords = ['서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'];
const themeKeywords = ['자연 속에서 힐링', '미식 여행 및 먹방 중심', '체험 및 액티비티', '문화예술 및 역사탐방', '기타'];

// --- HTML 디코딩 함수 ---
const decodeHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

interface MenuBarProps {
  editor: Editor | null;
  selectedRegion: string;
  onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedTheme: string;
  onThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  onMapClick: () => void;
  loading: boolean;
  isEditMode: boolean;
}

const MenuBar = ({ editor, selectedRegion, onRegionChange, selectedTheme, onThemeChange, onSubmit, onMapClick, loading, isEditMode }: MenuBarProps) => {
  if (!editor) { return null; }
  const dispatch = useDispatch<AppDispatch>();

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const resultAction = await dispatch(uploadImage(file));
        if (uploadImage.fulfilled.match(resultAction)) {
           const imageUrl = resultAction.payload;
           editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      } catch (error) {
        alert(`이미지 업로드 실패: ${error}`);
      }
    };
  }, [editor, dispatch]);

  const handleFontFamilyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { editor.chain().focus().setFontFamily(e.target.value).run(); }, [editor]);
  const handleFontSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value ? parseInt(e.target.value, 10) : 0;
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
  }, [editor]);
  
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroupLeft}>
        <button type="button" className={styles.mediaButton} onClick={addImage}><img src="/imgs/post_img.png" alt="사진" /><span>사진</span></button>
        <button type="button" className={styles.mediaButton} onClick={onMapClick}><img src="/imgs/post_place.png" alt="지도" /><span>지도</span></button>
        <div className={styles.divider}></div>
        <div className={styles.textStyleGroup}>
          <select className={styles.fontSelect} onChange={handleFontFamilyChange}>
            <option value="">기본 서체</option><option value="serif">명조체</option><option value="monospace">고딕체</option>
          </select>
          <select className={styles.fontSizeSelect} onChange={handleFontSizeChange}>
             <option value="0">본문</option><option value="3">제목3</option><option value="2">제목2</option><option value="1">제목1</option>
          </select>
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.isActive : ''}><b>B</b></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? styles.isActive : ''}><u>U</u></button>
          <div className={styles.divider}></div>
          <input type="color" onChange={(e: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(e.target.value).run()} className={styles.colorInput} />
        </div>
        <select className={styles.categorySelect} value={selectedRegion} onChange={onRegionChange}>
          <option value="">지역</option>
          {regionKeywords.map((region) => (<option key={region} value={region}>{region}</option>))}
        </select>
        <select className={`${styles.categorySelect} ${styles.themeSelect}`} value={selectedTheme} onChange={onThemeChange}>
          <option value="">테마</option>
          {themeKeywords.map((theme) => (<option key={theme} value={theme}>{theme}</option>))}
        </select>
      </div>
      <div className={styles.toolGroupRight}>
        <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={loading}>
          {loading ? '처리 중...' : isEditMode ? '수정하기' : '등록하기'}
        </button>
      </div>
    </div>
  );
};

const DynamicWritePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const id = params.id ? parseInt(params.id as string, 10) : null;
  const isEditMode = !!id;

  const { user: loggedInUser } = useSelector((state: RootState) => state.auth || {});
  const { loading, post } = useSelector((state: RootState) => state.board || {}); 
  
  const [title, setTitle] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline, Strike, TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, FontFamily, Color,
      ImageExtension.configure({ inline: false }),
      Placeholder.configure({ placeholder: '여기에 여행 후기, 꿀팁 등 내용을 자유롭게 작성해주세요.' }),
    ],
    content: '',
    editorProps: { 
      attributes: { 
        class: 'tiptap-editor',
        style: 'min-height: 500px; padding: 20px; outline: none; cursor: text;'
      } 
    },
  });

  // 초기 로딩 (수정 모드일 때 기존 게시글 데이터 불러오기)
  useEffect(() => {
    dispatch(clearBoardLoading());
    if (isEditMode && id) {
      dispatch(fetchBoardDetail(id));
    }
  }, [dispatch, id, isEditMode]);

  // 🔥 본인 글 검증 가드 로직 추가
  useEffect(() => {
    // 수정 모드이고, 게시글 정보가 로드되었으며, 로그인 상태일 때 대조 검사 실행
    if (isEditMode && post && loggedInUser) {
      const myIdentifier = loggedInUser.userIdentifier || loggedInUser.email;
      
      // 작성자의 식별자와 현재 로그인 유저의 식별자가 불일치할 경우 차단
      if (post.writerIdentifier !== myIdentifier) {
        alert('본인이 작성한 게시글만 수정할 수 있습니다.');
        router.replace('/post'); // 게시판 홈으로 추방
      }
    }
  }, [isEditMode, post, loggedInUser, router]);

  useEffect(() => {
    if (isEditMode && post && editor) {
      setTitle(post.title);
      setSelectedRegion(post.region);
      setSelectedTheme(post.theme);
      const decodedContent = post.content.includes('&lt;') || post.content.includes('&gt;') ? decodeHtml(post.content) : post.content;
      editor.commands.setContent(decodedContent);
    }
  }, [post, editor, isEditMode]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); }, []);
  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedRegion(e.target.value); }, []);
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedTheme(e.target.value); }, []);
  
  const openMapModal = useCallback(() => { setIsMapModalOpen(true); }, []);
  const closeMapModal = useCallback(() => { setIsMapModalOpen(false); }, []);
  
  const handleSelectPlace = useCallback((place: { name: string; address: string; lat: number; lng: number }) => {
    if (editor) {
        const staticMapUrl = `https://dapi.kakao.com/v2/staticmap?center=${place.lat},${place.lng}&level=4&marker=${place.lng},${place.lat}&w=600&h=200&appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}`;
        const placeHtml = `<div style="border:1px solid #ddd; padding:10px; border-radius:8px; margin:10px 0;"><img src="${staticMapUrl}" style="width:100%; height:150px; object-fit:cover;" /><div style="font-weight:bold;">${place.name}</div><div>${place.address}</div></div><p></p>`;
        editor.chain().focus().insertContent(placeHtml).run();
    }
  }, [editor]);
  
  const handleSubmit = useCallback(async () => {
    const htmlContent = editor?.getHTML() || '';
    if (!title.trim() || editor?.isEmpty || !selectedRegion || !selectedTheme) {
      alert('모든 항목을 입력해주세요.'); return;
    }

    if (!loggedInUser) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const firstImage = tempDiv.querySelector('img');
    const thumbnailPublicUrl = firstImage ? firstImage.src : '';

    const postData = { title, content: htmlContent, region: selectedRegion, theme: selectedTheme, thumbnailPublicUrl };

    try {
      if (isEditMode && id) {
        // 2차 검증: 전송 직전 최종적으로 한번 더 본인 확인 수행
        const myIdentifier = loggedInUser.userIdentifier || loggedInUser.email;
        if (post && post.writerIdentifier !== myIdentifier) {
          alert('본인 글만 수정할 수 있습니다.');
          return;
        }
        await dispatch(updateBoard({ id, ...postData })).unwrap();
        alert('성공적으로 수정되었습니다.');
      } else {
        await dispatch(createBoard(postData)).unwrap();
        alert('성공적으로 등록되었습니다.');
      }
      router.push('/post');
    } catch (err: any) {
      alert(`처리 실패: ${err}`);
    }
  }, [dispatch, router, title, editor, selectedRegion, selectedTheme, id, isEditMode, loggedInUser, post]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}><SearchBar onSearch={() => {}} /></section>
        <div className={styles.editorBackground}>
          <MenuBar editor={editor} selectedRegion={selectedRegion} onRegionChange={handleRegionChange} selectedTheme={selectedTheme} onThemeChange={handleThemeChange} onSubmit={handleSubmit} onMapClick={openMapModal} loading={loading || false} isEditMode={isEditMode} />
          <main className={styles.editorWrapper}>
            <input type="text" className={styles.titleInput} placeholder="제목을 입력해주세요" value={title} onChange={handleTitleChange} />
            <div className={styles.contentDivider}></div>
            <div className={styles.tiptapEditorContainer} style={{ minHeight: '600px', cursor: 'text' }} onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </main>
        </div>
      </div>
      {isMapModalOpen && <MapModal onClose={closeMapModal} onSelectPlace={handleSelectPlace} />}
    </div>
  );
};

export default DynamicWritePage;