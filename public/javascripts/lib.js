'use strict';

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var socket = io.connect('http://localhost:3000'); //소켓연결. 서버 IP에 맞게 수정

var row_width = 30;
var col_width = 30;
var row_num = 20;
var col_num = 40;
var photos = [];
var image_width = 50;
var image_height = 40;
var textArray;
var isEnd = true;
var photo_length = 0;

socket.on('refresh', function (data) {  //소켓에서 refresh 이벤트 발생했을 때 받아서 결과 새로 그려줌
  if (isEnd) {
    console.log("Refresh");
    makeResult(data);
    isEnd = false;
  }
});

$(document).ready(function(){
  //var initData = {};
  //initData.word = "PIZZA";  //처음에 표시될 문자열 설정
  //$.get("ajax/text", initData, function( ) {  //처음에 서버에 문자열 셋팅
  makeResult(); //결과 화면에 보여줌
  //});
});

function makeResult(data) {
  photos = [];  //사진 배열 초기화
  $.get("ajax/images", data, function( results ) {
    console.log("RESULTS:",results);
    context.clearRect(0, 0, canvas.width, canvas.height); //캔버스 초기화

    var photoArray = results.image.photos.photo;
    textArray = results.text;

    for(var i=0; i<photoArray.length; i++){
      photos.push(
          "http://farm"+photoArray[i].farm+".staticflickr.com/"+photoArray[i].server+"/"+photoArray[i].id+"_"+photoArray[i].secret+".jpg"
      );
    }
    photo_length = photos.length;
    var success = 0;
    var fail = 0;
    var checkAllLoaded = function() {
      if (success+fail === photo_length) {
        isEnd = true;
      }
    };
    photos.forEach(function(photo){ //이미지 로드 이벤트 등록
      var img = new Image;
      img.onload = function() { //이미지 로드 되었을때 배열에서 1인 부분에 이미지 그려줌
        drawImageFromArray(textArray, img);
        success++;
        checkAllLoaded();
      };
      img.onerror = function() {
        fail++;
        checkAllLoaded();
      };
      img.src = photo;
    });
  });
}

//배열의 1에 해당하는 위치에 이미지 그려줌
function drawImageFromArray(textArray, image) {
  var flag = false; //한개만 이미지 그리고 루프 끝내기위해 flag 사용
  for(var row=0; row<row_num; row++){
    if(flag){
      break;
    }
    for(var col=0; col<col_num; col++){ //배열의 숫자가 1인 위치에 이미지 그려줌
      if(textArray[row][col] === 1 || textArray[row][col] === "1"){
        var angle = Math.floor(Math.random() * 360) + 1;
        var x = col*col_width;
        var y = row*row_width;

        //console.log("x:",x," // ","y:",y," // ",image);
        //이미지 회전해서 그려줌
        drawRotatedImage(image, x, y, image_width, image_height, angle);
        textArray[row][col] = 0;
        flag = true;
        break;
      }
    }
  }
}

//이미지를 기울여서 그려주기 위한 함수
function drawRotatedImage(image, x, y, width, height, angle) {
  var cx     = x + 0.5 * width;   // x of shape center
  var cy     = y + 0.5 * height;  // y of shape center

  // save the current co-ordinate system
  // before we screw with it
  context.save();

  // move to the middle of where we want to draw our image
  context.translate(cx, cy);

  // rotate around that point, converting our
  // angle from degrees to radians
//  context.rotate(angle * TO_RADIANS);
  context.rotate( (Math.PI / 180) * angle );  //rotate angle degrees.

  context.translate(-cx, -cy);

  // draw it up and to the left by half the width
  // and height of the image
  context.drawImage(image, x, y, width, height);

  // and restore the co-ords to how they were when we began
  context.restore();
}




