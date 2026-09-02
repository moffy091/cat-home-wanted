'use strict';

const appConfig = window.APP_CONFIG || {};
const localCats = Array.isArray(window.CATS) ? window.CATS : [];

const buildImagePath = (path) => {
  if (!path) {
    return 'image/cat.png';
  }

  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) {
    return path;
  }

  if (path.startsWith('image/')) {
    return path;
  }

  return `image/${path}`;
};

const normalizeCat = (cat, index) => {
  const profileLines = Array.isArray(cat.profileLines) && cat.profileLines.length
    ? cat.profileLines
    : [
        cat.shortDescription || '',
        cat.type ? `種類: ${cat.type}` : '',
        cat.age ? `年齢: ${cat.age}` : '',
        (cat.gender || cat.sex) ? `性別: ${cat.gender || cat.sex}` : '',
        cat.status ? `募集状況: ${cat.status}` : '',
        cat.description || ''
      ].filter(Boolean);

  return {
    id: String(cat.id || `cat-${index + 1}`),
    name: cat.name || `保護猫${index + 1}`,
    age: cat.age || '',
    gender: cat.gender || cat.sex || '',
    type: cat.type || '',
    status: cat.status || '',
    image: buildImagePath(cat.image),
    alt: cat.alt || `${cat.name || '保護猫'}の写真`,
    shortDescription: cat.shortDescription || profileLines[0] || '',
    description: cat.description || '',
    profileLines
  };
};

const createSupabaseClient = () => {
  if (!window.supabase || !appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
    return null;
  }

  return window.supabase.createClient(
    appConfig.supabaseUrl,
    appConfig.supabaseAnonKey
  );
};

const loadCats = async () => {
  const supabaseClient = createSupabaseClient();

  if (!supabaseClient) {
    return localCats.map(normalizeCat);
  }

  try {
    const { data, error } = await supabaseClient
      .from(appConfig.petsTable || 'pets')
      .select('*');

    if (error) {
      throw error;
    }

    if (Array.isArray(data) && data.length) {
      return data.map(normalizeCat);
    }
  } catch (error) {
    console.warn('Supabaseから猫データを取得できなかったため、ローカルデータを使用します。', error);
  }

  return localCats.map(normalizeCat);
};

document.addEventListener('DOMContentLoaded', async () => {
  const cats = await loadCats();
  const page = document.body.dataset.page;

  const buildProfileUrl = (catId) => `profile.html?cat=${encodeURIComponent(catId)}`;
  const buildContactUrl = (catId) => `contact-form.html?cat=${encodeURIComponent(catId)}`;
  const getCatIdFromQuery = () => new URLSearchParams(window.location.search).get('cat');

  const renderHomePage = () => {
    const catGrid = document.getElementById('cat-grid');

    if (!catGrid) {
      return;
    }

    catGrid.innerHTML = cats.map((cat) => `
      <div class="cat-card">
        <a href="${buildProfileUrl(cat.id)}" class="cat-image-link">
          <img src="${cat.image}" alt="${cat.alt}" width="200" height="200">
        </a>
        <h3>${cat.name}</h3>
        <p>${cat.shortDescription}</p>
        <a href="${buildProfileUrl(cat.id)}" class="detail-button">詳細を見る</a>
      </div>
    `).join('');
  };

  const renderProfilePage = () => {
    const catId = getCatIdFromQuery();
    const currentIndex = cats.findIndex((cat) => String(cat.id) === catId);
    const activeIndex = currentIndex >= 0 ? currentIndex : 0;
    const currentCat = cats[activeIndex];

    if (!currentCat) {
      return;
    }

    const profileImage = document.getElementById('profile-image');
    const profileText = document.getElementById('profile-text');
    const contactLink = document.getElementById('contact-link');
    const prevLink = document.getElementById('prev-link');
    const nextLink = document.getElementById('next-link');
    const prevDisabled = document.getElementById('prev-disabled');
    const nextDisabled = document.getElementById('next-disabled');

    document.title = `${currentCat.name}のプロフィール`;
    profileImage.src = currentCat.image;
    profileImage.alt = currentCat.alt;
    profileText.innerHTML = currentCat.profileLines.join('<br>');
    contactLink.href = buildContactUrl(currentCat.id);

    const previousCat = cats[activeIndex - 1];
    const nextCat = cats[activeIndex + 1];

    if (previousCat) {
      prevLink.href = buildProfileUrl(previousCat.id);
      prevLink.hidden = false;
      prevDisabled.hidden = true;
    } else {
      prevLink.hidden = true;
      prevDisabled.hidden = false;
    }

    if (nextCat) {
      nextLink.href = buildProfileUrl(nextCat.id);
      nextLink.hidden = false;
      nextDisabled.hidden = true;
    } else {
      nextLink.hidden = true;
      nextDisabled.hidden = false;
    }
  };

  const renderContactPage = () => {
    const catId = getCatIdFromQuery();
    const currentCat = cats.find((cat) => cat.id === catId);
    const contactTarget = document.getElementById('contact-target');
    const catIdField = document.getElementById('cat-id');
    const messageField = document.getElementById('message');

    if (!contactTarget || !catIdField) {
      return;
    }

    if (!currentCat) {
      contactTarget.textContent = '気になる猫がいる場合は、問い合わせ内容に名前をご記入ください。';
      return;
    }

    contactTarget.textContent = `お問い合わせ対象: ${currentCat.name}`;
    catIdField.value = currentCat.id;

    if (messageField && !messageField.value) {
      messageField.value = `${currentCat.name}について問い合わせしたいです。`;
    }
  };

  const renderThanksPage = () => {
    const catId = getCatIdFromQuery();
    const currentCat = cats.find((cat) => cat.id === catId);
    const thanksMessage = document.getElementById('thanks-message');

    if (!thanksMessage || !currentCat) {
      return;
    }

    thanksMessage.textContent = `${currentCat.name}についてのお問い合わせを受け付けました。内容を確認の上、折り返しご連絡いたします。`;
  };

  if (page === 'home') {
    renderHomePage();
  }

  if (page === 'profile') {
    renderProfilePage();
  }

  if (page === 'contact') {
    renderContactPage();
  }

  if (page === 'thanks') {
    renderThanksPage();
  }

  const images = document.querySelectorAll('.zoomable-image');

  if (!images.length) {
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'zoom-modal';
  modal.setAttribute('aria-hidden', 'true');

  const modalImage = document.createElement('img');
  modalImage.alt = '';

  const closeButton = document.createElement('button');
  closeButton.className = 'zoom-modal-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '拡大画像を閉じる');
  closeButton.textContent = '閉じる';

  modal.appendChild(closeButton);
  modal.appendChild(modalImage);
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.removeAttribute('src');
    modalImage.alt = '';
  };

  const openModal = (image) => {
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  images.forEach((image) => {
    image.addEventListener('pointerup', () => openModal(image));
  });

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
});
