
window.onload = function () {
	if (sys.ie != 'undefined') {
		$('#pf').hover(function () {
			$('#set').show().hover(function () {
				$(this).show();
			},function () {
				$(this).hide();
			});
		},function () {
			$('#set').hide();
		});
	}else{
		alert('sys.ie');
	}
	if (sys.ie != 'undefined') {
		$('#bri').hover(function () {
			$('#more').show().hover(function () {
				$(this).show();
			},function () {
				$(this).hide();
			});
		},function () {
			$('#more').hide();
		});
	}else{
		alert('sys.ie');
	}
}

