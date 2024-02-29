// $('#myCarousel').carousel({
//   interval: 10000
// })

// $('.carousel .item').each(function(){
//   var next = $(this).next();
//   if (!next.length) {
//     next = $(this).siblings(':first');
//   }
//   next.children(':first-child').clone().appendTo($(this));
  
//   if (next.next().length>0) {
//     next.next().children(':first-child').clone().appendTo($(this));
//   }
//   else {
//   	$(this).siblings(':first').children(':first-child').clone().appendTo($(this));
//   }
// });
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
	console.log("Mobile device detected");
	$(document).ready(function(){
		$('.your-class').slick({
			infinite: false,
			slidesToShow: 1,
			slidesToScroll: 1,
			dots: true,
			// customPaging : function(slider, i) {
			// 	var thumb = $(slider.$slides[i]).data();
			// 	console.log(thumb)
			// 	return  '<a>' + (i+1) + '</a>';
			// },
			centerMode: true,
			focusOnSelect: true,
			autoplaySpeed: 3000,
			arrows:true,
			adaptiveHeight: false
		});
	});
} else {
  	console.log("Desktop device detected");
	$(document).ready(function(){
		$('.your-class').slick({
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1,
			dots: true,
			// customPaging : function(slider, i) {
			// 	var thumb = $(slider.$slides[i]).data();
			// 	console.log(thumb)
			// 	return  '<a>' + (i+1) + '</a>';
			// },
			centerMode: true,
			focusOnSelect: true,
			autoplaySpeed: 3000,
			arrows:true,
			adaptiveHeight: false
		});
	});
}
