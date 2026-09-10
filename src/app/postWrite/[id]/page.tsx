'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { 
  createBoard, 
  updateBoard, 
  uploadImages,
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
import { Image as ImageExtension } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder'; 
import Heading from '@tiptap/extension-heading';

import styles from '../../../../styles/postWrite/postWrite.module.scss';
import SearchBar from '../../SearchBar/SearchBar'; 
import MapModal from '../MapModal';

const regionKeywords = [
  '가평/양평', '강릉', '경주', '강남', '부산', '여수', '인천',
  '중구/강북', '전주', '제주', '춘천/홍천', '태안', '통영/거제', '포항/안동'
];

const themeKeywords = [
  '체험 및 액티비티', '자연 속에서 힐링', '열정적인 쇼핑투어',
  '미식 여행/먹방 중심', '문화 예술 및 역사 탐방'
];

const decodeHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
            style: `width: ${attributes.width}; max-width: 100%; height: auto; border-radius: 8px; display: block; margin: ${
              attributes.alignment === 'left'
                ? '12px auto 12px 0'
                : attributes.alignment === 'right'
                ? '12px 0 12px auto'
                : '12px auto'
            };`,
          };
        },
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          return {
            'data-alignment': attributes.alignment,
          };
        },
      },
    };
  },
});

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
  const dispatch = useDispatch<AppDispatch>();
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const addImage = useCallback(() => {
    if (!editor) return;
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

  const handleFontFamilyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { 
    editor?.chain().focus().setFontFamily(e.target.value).run(); 
  }, [editor]);

  const handleFontSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editor) return;
    const level = e.target.value ? parseInt(e.target.value, 10) : 0;
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const isImageActive = editor.isActive('image');
  const currentImgSrc = editor.getAttributes('image').src || '';
  const currentWidth = editor.getAttributes('image').width || '100%';
  const currentAlign = editor.getAttributes('image').alignment || 'center';

  const handleSetImageWidth = (width: string) => {
    editor.chain().focus().updateAttributes('image', { width }).run();
  };

  const handleSetImageAlign = (alignment: string) => {
    editor.chain().focus().updateAttributes('image', { alignment }).run();
  };

  const handleDeleteImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const btnStyle = (active: boolean) => ({
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: active ? '700' : '500',
    borderRadius: '4px',
    border: active ? '1px solid #27abf1' : '1px solid #cbd5e1',
    backgroundColor: active ? '#27abf1' : '#ffffff',
    color: active ? '#ffffff' : '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });
  
  return (
    <>
      <div className={styles.toolbar} style={{ flexWrap: 'wrap', gap: '8px' }}>
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

        {isImageActive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f0f9ff',
            border: '2px solid #27abf1',
            padding: '4px 12px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(39, 171, 241, 0.15)',
          }}>
            {currentImgSrc && (
              <img 
                src={currentImgSrc} 
                alt="선택된 사진" 
                style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #bae6fd' }} 
              />
            )}

            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7' }}>
              선택된 사진 ({currentWidth})
            </span>

            <div style={{ width: '1px', height: '14px', backgroundColor: '#bae6fd' }} />

            <button type="button" onClick={() => handleSetImageWidth('25%')} style={btnStyle(currentWidth === '25%')}>25%</button>
            <button type="button" onClick={() => handleSetImageWidth('50%')} style={btnStyle(currentWidth === '50%')}>50%</button>
            <button type="button" onClick={() => handleSetImageWidth('75%')} style={btnStyle(currentWidth === '75%')}>75%</button>
            <button type="button" onClick={() => handleSetImageWidth('100%')} style={btnStyle(currentWidth === '100%')}>100%</button>

            <div style={{ width: '1px', height: '14px', backgroundColor: '#bae6fd' }} />

            <button type="button" onClick={() => handleSetImageAlign('left')} style={btnStyle(currentAlign === 'left')}>좌측</button>
            <button type="button" onClick={() => handleSetImageAlign('center')} style={btnStyle(currentAlign === 'center')}>중앙</button>
            <button type="button" onClick={() => handleSetImageAlign('right')} style={btnStyle(currentAlign === 'right')}>우측</button>

            <div style={{ width: '1px', height: '14px', backgroundColor: '#bae6fd' }} />

            <button 
              type="button" 
              onClick={handleDeleteImage} 
              style={{ ...btnStyle(false), color: '#ef4444', borderColor: '#fca5a5' }}
              title="사진 삭제"
            >
              삭제
            </button>

            <button
              type="button"
              onClick={() => setIsGuideModalOpen(true)}
              style={{
                background: '#e0f2fe',
                border: '1px solid #7dd3fc',
                color: '#0369a1',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ❓ 사용법
            </button>
          </div>
        )}

        <div className={styles.toolGroupRight}>
          <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={loading}>
            {loading ? '처리 중...' : isEditMode ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>

      {isGuideModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#1e293b' }}>🖼️ 사진 조절 가이드</h3>
              <button 
                onClick={() => setIsGuideModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0 }}>
                <strong>1. 사진 선택하기</strong><br />
                본문 안의 사진을 클릭하면 <strong>파란색 테두리</strong>가 생기며 상단에 조절 툴바가 나타납니다.
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. 빠른 크기 변경 (25% ~ 100%)</strong><br />
                상단 툴바의 <strong>[25%], [50%], [75%], [100%]</strong> 버튼을 눌러 사진 크기를 한 번에 변경할 수 있습니다.
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. 원하는 크기 직접 입력 (더블 클릭)</strong><br />
                사진을 <strong>더블 클릭</strong>하면 입력창이 나타나 <code>350px</code> 또는 <code>60%</code>처럼 원하는 수치를 세밀하게 입력할 수 있습니다.
              </p>
              <p style={{ margin: 0 }}>
                <strong>4. 사진 정렬</strong><br />
                [좌측], [중앙], [우측] 버튼으로 사진의 위치를 맞출 수 있습니다.
              </p>
            </div>

            <button
              onClick={() => setIsGuideModalOpen(false)}
              style={{
                width: '100%',
                marginTop: '18px',
                padding: '10px 0',
                backgroundColor: '#27abf1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const DynamicWritePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const id = params.id ? parseInt(params.id as string, 10) : null;
  const isEditMode = !!id;

  const { user: loggedInUser, loading: authLoading } = useSelector((state: RootState) => state.auth || {});
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
      CustomImage.configure({ inline: false }),
      Placeholder.configure({ placeholder: '여기에 여행 후기, 꿀팁 등 내용을 자유롭게 작성해주세요.' }),
    ],
    content: '',
    editorProps: { 
      attributes: { 
        class: 'tiptap-editor',
        style: 'min-height: 500px; padding: 20px; outline: none; cursor: text;'
      },
      handleDOMEvents: {
        dblclick: (view, event) => {
          const target = event.target as HTMLElement;
          if (target && target.tagName === 'IMG') {
            const imgTarget = target as HTMLImageElement;
            if (!imgTarget.src.includes('map') && !imgTarget.src.includes('daum')) {
              const currentW = imgTarget.style.width || imgTarget.getAttribute('width') || '100%';
              const newW = prompt('사진 크기를 입력해주세요 (예: 50%, 400px, 100%):', currentW);
              if (newW && newW.trim()) {
                const { state, dispatch: trDispatch } = view;
                const pos = view.posAtDOM(imgTarget, 0);
                const node = state.doc.nodeAt(pos);
                if (node && node.type.name === 'image') {
                  const tr = state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    width: newW.trim(),
                  });
                  trDispatch(tr);
                }
              }
              return true;
            }
          }
          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (!authLoading && !loggedInUser) {
      alert('로그인이 필요한 서비스입니다.');
      router.replace('/login');
    }
  }, [loggedInUser, authLoading, router]);

  useEffect(() => {
    dispatch(clearBoardLoading());
    if (isEditMode && id) {
      dispatch(fetchBoardDetail(id));
    }
  }, [dispatch, id, isEditMode]);

  const isAuthor = useMemo(() => {
    if (!post || !loggedInUser) return false;
    const myIdentifier = loggedInUser.userIdentifier || loggedInUser.email;
    const myName = loggedInUser.name;

    if (post.writerIdentifier && myIdentifier) {
      return post.writerIdentifier === myIdentifier;
    }
    if (post.writer && myName) {
      return post.writer === myName;
    }
    return false;
  }, [post, loggedInUser]);

  useEffect(() => {
    if (isEditMode && post && loggedInUser) {
      if (!isAuthor) {
        alert('본인이 작성한 게시글만 수정할 수 있습니다.');
        router.replace('/post');
      }
    }
  }, [isEditMode, post, loggedInUser, isAuthor, router]);

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
  
  const handleSelectPlace = useCallback(async (place: { name: string; address: string; lat: number; lng: number }) => {
    if (!editor) return;

    const getStaticMapImageUrl = (): Promise<string> => {
      return new Promise((resolve) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.StaticMap) {
          resolve('');
          return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.style.width = '600px';
        tempDiv.style.height = '240px';
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        try {
          const marker = {
            position: new window.kakao.maps.LatLng(place.lat, place.lng),
            text: place.name
          };
          new window.kakao.maps.StaticMap(tempDiv, {
            center: new window.kakao.maps.LatLng(place.lat, place.lng),
            level: 3,
            marker: marker
          });

          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            const img = tempDiv.querySelector('img');
            if (img && img.src && !img.src.includes('bg_tile')) {
              clearInterval(interval);
              const src = img.src;
              tempDiv.remove();
              resolve(src);
            } else if (attempts > 20) {
              clearInterval(interval);
              tempDiv.remove();
              resolve('');
            }
          }, 50);
        } catch (e) {
          tempDiv.remove();
          resolve('');
        }
      });
    };

    const mapImgUrl = await getStaticMapImageUrl();

    const placeHtml = `
      <p></p>
      ${mapImgUrl ? `<img src="${mapImgUrl}" alt="${place.name} 지도" width="100%" />` : ''}
      <p style="font-size: 16px; font-weight: bold; margin-top: 6px;">📍 ${place.name}</p>
      <p style="font-size: 13px; color: #6b7280; margin-top: 2px;">${place.address}</p>
      <p><a href="https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" style="color: #27abf1; font-size: 13px; text-decoration: underline;">👉 카카오맵에서 길찾기 및 크게보기</a></p>
      <p></p>
    `;

    editor.chain().focus().insertContent(placeHtml).run();
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
        if (!isAuthor) {
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
  }, [dispatch, router, title, editor, selectedRegion, selectedTheme, id, isEditMode, loggedInUser, isAuthor]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centeredContainer}>
        <section className={styles.searchSection}><SearchBar onSearch={() => {}} /></section>
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
            isEditMode={isEditMode} 
          />
          <main className={styles.editorWrapper}>
            <input type="text" className={styles.titleInput} placeholder="제목을 입력해주세요" value={title} onChange={handleTitleChange} />
            <div className={styles.contentDivider}></div>

            <style dangerouslySetInnerHTML={{ __html: `
              .tiptap-editor img.ProseMirror-selectednode {
                outline: 3.5px solid #27abf1 !important;
                outline-offset: 4px;
                box-shadow: 0 4px 16px rgba(39, 171, 241, 0.4) !important;
                border-radius: 8px;
              }
            `}} />

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