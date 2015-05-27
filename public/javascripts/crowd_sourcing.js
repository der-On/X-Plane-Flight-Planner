function CrowdSourcing() {
  var dial = $('#crowd-sourcing');

  dial.dialog({
    height:'auto',
    width:600,
    resizable:false,
    close:function(){dial.remove();},
    buttons: [
      {
        text: 'Donate with PayPal',
        click: function () {
          window.location.href = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DNL9MGKS39BAJ';
        }
      },
      {
        text: 'Drop me a line',
        click: function () {
          window.location.href = 'mailto:info@anzui.de?subject=' + encodeURIComponent('I want to support the new X-Plane Flight-Planner')
        }
      }
    ]
  });
}
