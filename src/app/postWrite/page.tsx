'use client';

import React, { useState, useCallback } from 'react';
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
import SearchBar from '../../app/SearchBar/SearchBar';

const regionKeywords = [
  '서울',
  '인천',
  '대전',
  '대구',
  '광주',
  '부산',
  '울산',
  '경기',
  '강원',
  '충북',
  '충남',
  '세종',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
  '가평',
  '양양',
  '강릉',
  '경주',
  '전주',
  '여수',
  '춘천',
  '홍천',
  '태안',
  '통영',
  '거제',
  '포항',
  '안동',
];
const themeKeywords = ['힐링', '액티비티', '맛집', '문화'];

interface MenuBarProps {
  editor: Editor | null;
  selectedRegion: string;
  onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedTheme: string;
  onThemeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
}

const MenuBar = ({
  editor,
  selectedRegion,
  onRegionChange,
  selectedTheme,
  onThemeChange,
  onSubmit,
}: MenuBarProps) => {
  if (!editor) {
    return null;
  }

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

  const handleFontFamilyChange = useCallback(
    (_e: React.ChangeEvent<HTMLSelectElement>) => {
      editor.chain().focus().setFontFamily(_e.target.value).run();
    },
    [editor]
  );

  const handleFontSizeChange = useCallback(
    (_e: React.ChangeEvent<HTMLSelectElement>) => {
      const level = _e.target.value ? parseInt(_e.target.value, 10) : 0;
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor
          .chain()
          .focus()
          .toggleHeading({ level: level as 1 | 2 | 3 })
          .run();
      }
    },
    [editor]
  );

  const toggleBold = useCallback(
    () => editor.chain().focus().toggleBold().run(),
    [editor]
  );
  const toggleItalic = useCallback(
    () => editor.chain().focus().toggleItalic().run(),
    [editor]
  );
  const toggleUnderline = useCallback(
    () => editor.chain().focus().toggleUnderline().run(),
    [editor]
  );
  const toggleStrike = useCallback(
    () => editor.chain().focus().toggleStrike().run(),
    [editor]
  );

  const handleColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      editor.chain().focus().setColor(event.target.value).run();
    },
    [editor]
  );

  const setTextAlign = useCallback(
    (align: string) => () => editor.chain().focus().setTextAlign(align).run(),
    [editor]
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroupLeft}>
        <button className={styles.mediaButton} onClick={addImage}>
          <img src="/imgs/post_img.png" alt="사진" />
          <span>사진</span>
        </button>
        <button className={styles.mediaButton}>
          <img src="/imgs/post_place.png" alt="지도" />
          <span>지도</span>
        </button>
        <div className={styles.divider}></div>
        <div className={styles.textStyleGroup}>
          <select
            className={styles.fontSelect}
            value={editor.getAttributes('textStyle').fontFamily || ''}
            onChange={handleFontFamilyChange}
          >
            <option value="">기본 서체</option>
            <option value="serif">명조체</option>
            <option value="monospace">고딕체</option>
          </select>
          <select
            className={styles.fontSizeSelect}
            value={editor.getAttributes('heading').level || ''}
            onChange={handleFontSizeChange}
          >
            <option value="">12</option>
            <option value="3">14</option>
            <option value="2">18</option>
            <option value="1">24</option>
          </select>
          <div className={styles.divider}></div>
          <button
            onClick={toggleBold}
            className={editor.isActive('bold') ? styles.isActive : ''}
          >
            <b>B</b>
          </button>
          <button
            onClick={toggleItalic}
            className={editor.isActive('italic') ? styles.isActive : ''}
          >
            <i>I</i>
          </button>
          <button
            onClick={toggleUnderline}
            className={editor.isActive('underline') ? styles.isActive : ''}
          >
            <u>U</u>
          </button>
          <button
            onClick={toggleStrike}
            className={editor.isActive('strike') ? styles.isActive : ''}
          >
            <s>T</s>
          </button>
          <div className={styles.divider}></div>
          <input
            type="color"
            onInput={handleColorChange}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className={styles.colorInput}
          />
          <div className={styles.divider}></div>
          <button
            onClick={setTextAlign('left')}
            className={
              editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''
            }
          >
            ☰
          </button>
          <button
            onClick={setTextAlign('center')}
            className={
              editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''
            }
          >
            ≡
          </button>
          <button
            onClick={setTextAlign('right')}
            className={
              editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''
            }
          >
            ≔
          </button>
        </div>
        <select
          className={styles.categorySelect}
          value={selectedRegion}
          onChange={onRegionChange}
        >
          <option value="">지역</option>
          {regionKeywords.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          className={`${styles.categorySelect} ${styles.themeSelect}`}
          value={selectedTheme}
          onChange={onThemeChange}
        >
          <option value="">테마</option>
          {themeKeywords.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.toolGroupRight}>
        <button className={styles.submitButton} onClick={onSubmit}>
          등록하기
        </button>
      </div>
    </div>
  );
};

const WritePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      Strike,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily,
      Color,
      Image,
      Placeholder.configure({
        placeholder: '오늘은 어떤 즐거운 여정을 떠났나요?',
      }),
    ],
    content: '',
    editorProps: { attributes: { class: 'tiptap-editor' } },
  });

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedRegion(e.target.value);
    },
    []
  );

  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedTheme(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log({
      title,
      content: editor?.getHTML(),
      region: selectedRegion,
      theme: selectedTheme,
    });
    alert('콘솔에서 등록될 데이터를 확인하세요.');
  }, [editor, selectedRegion, selectedTheme, title]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </section>
        <div className={styles.editorBackground}>
          <MenuBar
            editor={editor}
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            selectedTheme={selectedTheme}
            onThemeChange={handleThemeChange}
            onSubmit={handleSubmit}
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
    </div>
  );
};

export default WritePage;
