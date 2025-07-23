'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { createBoard } from '../../../util/board/boardSilce';

// TipTap 관련 hook과 컴포넌트, 타입 import
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';

import styles from '../../../styles/postWrite/postWrite.module.scss';
import SearchBar from '../../app/SearchBar/SearchBar'; // ✅ 경로 수정
import MapModal from '../../app/postWrite/MapModal';     // ✅ 경로 수정

const regionKeywords = ['서울','인천','대전','대구','광주','부산','울산','경기','강원','충북','충남','세종','전북','전남','경북','경남','제주','가평','양양','강릉','경주','전주','여수','춘천','홍천','태안','통영','거제','포항','안동'];
const themeKeywords = [
    '자연 속에서 힐링', '미식 여행 및 먹방 중심', '체험 및 액티비티',
    '문화예술 및 역사탐방', '기타'
];

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

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: url }).run();
    };
  }, [editor]);

  const handleFontFamilyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { editor.chain().focus().setFontFamily(e.target.value).run(); }, [editor]);
  const handleFontSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value ? parseInt(e.target.value, 10) : 0;
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
  }, [editor]);
  const toggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor]);
  const toggleStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor]);
  const handleColorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { editor.chain().focus().setColor(event.target.value).run(); }, [editor]);
  const setTextAlign = useCallback((align: string) => () => editor.chain().focus().setTextAlign(align).run(), [editor]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroupLeft}>
        <button className={styles.mediaButton} onClick={addImage}><img src="/imgs/post_img.png" alt="사진" /><span>사진</span></button>
        <button className={styles.mediaButton} onClick={onMapClick}><img src="/imgs/post_place.png" alt="지도" /><span>지도</span></button>
        <div className={styles.divider}></div>
        <div className={styles.textStyleGroup}>
          <select className={styles.fontSelect} value={editor.getAttributes('textStyle').fontFamily || ''} onChange={handleFontFamilyChange}>
            <option value="">기본 서체</option><option value="serif">명조체</option><option value="monospace">고딕체</option>
          </select>
          <select className={styles.fontSizeSelect} value={editor.getAttributes('heading').level || ''} onChange={handleFontSizeChange}>
            <option value="">12</option><option value="3">14</option><option value="2">18</option><option value="1">24</option>
          </select>
          <div className={styles.divider}></div>
          <button onClick={toggleBold} className={editor.isActive('bold') ? styles.isActive : ''}><b>B</b></button>
          <button onClick={toggleItalic} className={editor.isActive('italic') ? styles.isActive : ''}><i>I</i></button>
          <button onClick={toggleUnderline} className={editor.isActive('underline') ? styles.isActive : ''}><u>U</u></button>
          <button onClick={toggleStrike} className={editor.isActive('strike') ? styles.isActive : ''}><s>T</s></button>
          <div className={styles.divider}></div>
          <input type="color" onInput={handleColorChange} value={editor.getAttributes('textStyle').color || '#000000'} className={styles.colorInput} />
          <div className={styles.divider}></div>
          <button onClick={setTextAlign('left')} className={editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}>☰</button>
          <button onClick={setTextAlign('center')} className={editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}>≡</button>
          <button onClick={setTextAlign('right')} className={editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}>≔</button>
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
        <button className={styles.submitButton} onClick={onSubmit} disabled={loading}>
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  );
};

const WritePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.board);
  
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
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: '오늘은 어떤 즐거운 여정을 떠났나요?' }),
    ],
    content: '',
    editorProps: { attributes: { class: 'tiptap-editor' } },
  });

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); }, []);
  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedRegion(e.target.value); }, []);
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedTheme(e.target.value); }, []);
  
  const openMapModal = useCallback(() => { setIsMapModalOpen(true); }, []);
  const closeMapModal = useCallback(() => { setIsMapModalOpen(false); }, []);
  
  const handleSelectPlace = useCallback((place: { name: string; address: string; lat: number; lng: number }) => {
    if (editor) {
        const KAKAO_APP_KEY = '705ecc4de821b5770092b4aeff178932';
        const staticMapUrl = `https://dapi.kakao.com/v2/staticmap?center=${place.lat},${place.lng}&level=4&marker=(${place.lng},${place.lat})&w=600&h=200&appkey=${KAKAO_APP_KEY}`;
        const placeHtml = `
            <div data-place-name="${place.name}" style="border:1px solid #ddd; padding:10px; border-radius:8px; margin:10px 0; overflow:hidden;">
                <img src="${staticMapUrl}" alt="${place.name} 지도" style="width:100%; height:150px; object-fit:cover; border-bottom:1px solid #eee; margin-bottom:10px;" />
                <strong>${place.name}</strong><br/>
                <p style="font-size: 14px; color: #888; margin: 4px 0 0 0;">${place.address}</p>
            </div>
        `;
        editor.chain().focus().insertContent(placeHtml, { parseOptions: { preserveWhitespace: false } }).run();
    }
  }, [editor]);
  
  const handleSubmit = useCallback(async () => {
    const content = editor?.getHTML() || '';
    
    if (!title.trim() || content === '<p></p>' || !selectedRegion || !selectedTheme) {
      alert('제목, 내용, 지역, 테마를 모두 입력해주세요.');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const firstImage = tempDiv.querySelector('img');
    const thumbnailPublicUrl = firstImage ? firstImage.src : '';

    const newPost = {
      title,
      content,
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
      console.error('게시글 등록 실패:', err);
    }
  }, [dispatch, router, title, editor, selectedRegion, selectedTheme]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          {/* ✅ SearchBar props 문제를 해결하기 위해 내부 상태 관리 방식으로 변경 */}
          <SearchBar onSearch={(term) => console.log('검색:', term)} />
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
            loading={loading}
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
            <EditorContent
              editor={editor}
              className={styles.tiptapEditorContainer}
            />
          </main>
        </div>
      </div>
      <footer className={styles.footer}></footer>

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