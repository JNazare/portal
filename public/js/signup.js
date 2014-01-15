$( "#submit_button" ).click(function() {
	var role = $("#role option:selected").text();
	var city = $("#city option:selected").text();
	$("#role_input").val(role);
	$("#city_input").val(city);
});