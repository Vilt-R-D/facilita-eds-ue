function thisMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

$('.chatbia-open').click(() => {
  $('.chatbia-open').hide();
  $('.chatbia-close').css('display', 'flex');
  $('.container-bia-qrcode').animate({
    right: thisMobile ? '65px' : '80px',
    opacity: '1',
  }, 'slow');
});
$('.chatbia-close').click(() => {
  $('.chatbia-close').hide();
  $('.chatbia-open').show();
  $('.container-bia-qrcode').animate({
    right: '-288px',
    opacity: '0',
  }, 'slow');
  trackBia('botao-flutuante-bia', 'clique-botao', 'fechar', 'bia', 'bia');
});
$('.chatbia-open').click((e) => {
  trackBia('botao-flutuante-bia', 'clique-botao', 'fale-com-a-bia', 'bia', 'bia');
});
$('#chatbia-button').click((e) => {
  trackBia('botao-flutuante-bia', 'clique-botao', 'fale-com-a-bia', 'bia', 'bia');
});

document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 768) {
    $('.container-chatbia-qrcode').hide();
    $('#chatbia').css('display', 'block');
    $('#chatbia-button').css('display', 'block');
  }
});
