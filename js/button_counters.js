let counter = document.getElementsByClassName('counter')[0];
let input = document.getElementById('pattern_field');

input.onfocus = function (e) {
  counter.textContent = String(input.maxLength - input.value.length);
};

input.addEventListener ('keydown', function (e) {
  console.log(input.maxLength);
  counter.textContent = String(input.maxLength - input.value.length);
});

input.addEventListener ('keyup', function (e) {
  console.log(input.maxLength);
  counter.textContent = String(input.maxLength - input.value.length);
});

input.onblur = function (e) {
  if (input.value.length === 0) {
    counter.textContent = '';
  }
};
