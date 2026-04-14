'use strict'
  // HTMLの読み込みが終わってから処理を開始する
document.addEventListener('DOMContentLoaded', () => {
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
    image.addEventListener('click', () => openModal(image));
    image.addEventListener('touchend',() => openModal(image));
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
