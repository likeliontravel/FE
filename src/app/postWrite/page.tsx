'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { 
  createBoard, 
  uploadImages, 
  clearBoardLoading 
} from '../../../util/board/boardSilce';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Image as ImageExtension } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder'; 
import Heading from '@tiptap/extension-heading';

import styles from '../../../styles/postWrite/postWrite.module.scss';
import SearchBar from '../SearchBar/SearchBar'; 
import MapModal from './MapModal';

const regionKeywords = ['서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'];
const themeKeywords = ['자연 속에서 힐링', '미식 여행 및 먹방 중심', '체험 및 액티비티', '문화예술 및 역사탐방', '기타'];

interface MenuBarProps {
  editor: Editor | null;
  selectedRegion: string;
  onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedTheme: string;
  onThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  onMapClick: () => void;
  loading: boolean;
}

const MenuBar = ({ editor, selectedRegion, onRegionChange, selectedTheme, onThemeChange, onSubmit, onMapClick, loading }: MenuBarProps) => {
  if (!editor) { return null; }
  const dispatch = useDispatch<AppDispatch>();

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'true');
    input.click();

    input.onchange = async () => {
      const files = input.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      if (fileArray.length > 5) {
        alert('게시글 이미지는 최대 5장까지 업로드할 수 있습니다.');
        return;
      }

      try {
        const imageUrls = await dispatch(uploadImages(fileArray)).unwrap();
        
        imageUrls.forEach((url: string) => {
          editor.chain().focus().setImage({ src: url }).run();
        });
      } catch (error: any) {
        alert(`이미지 업로드 실패: ${error || '서버 에러가 발생했습니다.'}`);
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
        <button type="button" className={styles.mediaButton} onClick={addImage}>
          <img src="/imgs/post_img.png" alt="사진" />
          <span>사진</span>
        </button>
        <button type="button" className={styles.mediaButton} onClick={onMapClick}>
          <img src="/imgs/post_place.png" alt="지도" />
          <span>지도</span>
        </button>
        <div className={styles.divider}></div>
        <div className={styles.textStyleGroup}>
          <select className={styles.fontSelect} onChange={handleFontFamilyChange}>
            <option value="">기본 서체</option><option value="serif">명조체</option><option value="monospace">고딕체</option>
          </select>
          <select className={styles.fontSizeSelect} onChange={handleFontSizeChange}>
             <option value="0">본문</option><option value="3">제목3</option><option value="2">제목2</option><option value="1">제목1</option>
          </select>
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.isActive : ''}><b>B</b></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.isActive : ''}><i>I</i></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? styles.isActive : ''}><u>U</u></button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? styles.isActive : ''}><s>T</s></button>
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
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  );
};

const WritePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth || {});
  const { loading } = useSelector((state: RootState) => state.board || {}); 
  
  useEffect(() => {
    dispatch(clearBoardLoading());
  }, [dispatch]);

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

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); }, []);
  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedRegion(e.target.value); }, []);
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedTheme(e.target.value); }, []);
  
  const openMapModal = useCallback(() => { setIsMapModalOpen(true); }, []);
  const closeMapModal = useCallback(() => { setIsMapModalOpen(false); }, []);
  
  const handleSelectPlace = useCallback((place: { name: string; address: string; lat: number; lng: number }) => {
    if (editor) {
        const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '705ecc4de821b5770092b4aeff178932';
        const staticMapUrl = `https://dapi.kakao.com/v2/maps/staticmap?appkey=${KAKAO_KEY}&center=${place.lng},${place.lat}&level=3&marker=pos:${place.lng},${place.lat}&w=600&h=200`;
        const placeHtml = `
          <p></p>
          <img src="${staticMapUrl}" alt="${place.name} 지도" style="width: 100%; max-width: 600px; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
          <p style="margin-top: 6px; font-size: 16px; font-weight: bold;">📍 ${place.name}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 2px;">${place.address}</p>
          <p></p>
        `;
        editor.chain().focus().insertContent(placeHtml).run();
    }
  }, [editor]);
  
  const handleSubmit = useCallback(async () => {
    const htmlContent = editor?.getHTML() || '';
    
    if (!title.trim() || editor?.isEmpty || !selectedRegion || !selectedTheme) {
      alert('제목, 내용, 지역, 테마를 모두 입력해주세요.');
      return;
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

    const newPost = {
      title,
      content: htmlContent,
      region: selectedRegion,
      theme: selectedTheme,
      thumbnailPublicUrl,
    };

    try {
      await dispatch(createBoard(newPost)).unwrap();
      alert('게시글이 성공적으로 등록되었습니다.');
      router.push('/post');
    } catch (err: any) {
      alert(`게시글 등록 실패: ${err}`);
    }
  }, [dispatch, router, title, editor, selectedRegion, selectedTheme, loggedInUser]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          <SearchBar onSearch={() => {}} />
        </section>
        <div className={styles.editorBackground}>
          <MenuBar
            editor={editor}
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            selectedTheme={selectedTheme}
            onThemeChange={handleThemeChange}
            onSubmit={handleSubmit}
            onMapClick={openMapModal}
            loading={loading || false}
          />
          <main className={styles.editorWrapper}>
            <input
              type="text"
              className={styles.titleInput}
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={handleTitleChange}
            />
            <div className={styles.contentDivider}></div>
            <div className={styles.tiptapEditorContainer} style={{ minHeight: '600px', cursor: 'text' }} onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </main>
        </div>
      </div>
      
      {isMapModalOpen && (
          <MapModal 
            onClose={closeMapModal} 
            onSelectPlace={handleSelectPlace} 
          />
      )}
    </div>
  );
};

export default WritePage;