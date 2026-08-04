'use strict'

document.addEventListener('DOMContentLoaded', () => {
  const cats = window.CATS || [];
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
    const currentIndex = cats.findIndex((cat) => cat.id === catId);
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
    profileText.innerHTML = [
      `名前：${currentCat.name}`,
      ...currentCat.profileLines
    ].join('<br>');
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

  // 拡大表示の対象にしたい画像を全て取得する
  const images = document.querySelectorAll('.zoomable-image');

  // 対象画像がなければ何もしない
  if (!images.length) {
    return;
  }

  // 拡大表示用の背景モーダルを作成する
  const modal = document.createElement('div');
  modal.className = 'zoom-modal';
  modal.setAttribute('aria-hidden', 'true');

  // モーダル内に表示する拡大画像を作成する
  const modalImage = document.createElement('img');
  modalImage.alt = '';

  // モーダルを閉じるためのボタンを作成する
  const closeButton = document.createElement('button');
  closeButton.className = 'zoom-modal-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '拡大画像を閉じる');
  closeButton.textContent = '閉じる';


  // ボタンと画像モーダルに追加する
  modal.appendChild(closeButton);
  modal.appendChild(modalImage);

  // 作成したモーダルをページ全体に追加する
  document.body.appendChild(modal);

  // モーダルを閉じる処理
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.removeAttribute('src');
    modalImage.alt = '';
  };

  // クリックした画像をモーダル内に表示して開く処理
  const openModal = (image) => {
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  // 各プロフィール画像にクリックイベントをつける
  images.forEach((image) => {
    image.addEventListener('pointerup', () => openModal(image));
 
  });

  // 閉じるボタンを押したらモーダルを閉じる
  closeButton.addEventListener('click', closeModal);

  // 背景部分をクリックしたときだけモーダルを閉じる
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  // Escキーでモーダルを閉じる
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
});
