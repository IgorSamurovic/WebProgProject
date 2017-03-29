Modal = {
	_modals : {},
	
	getHTML : function(name, cls) {
		return `
		    <div class="hidden modal" name="${name}Modal">
		    	<div class="modalWindow">
					<div class="page ${cls}">
					    <div class="pageheader" name="${name}ModalHeader"></div>
						<div class="pagecontent" name="${name}ModalContent"></div>
					</div>
				</div>
			</div>`;
	},
	
	byName : function(name) {
		return this._modals[name];
	},
	
	display : function(doDisplay=true) {
		if (doDisplay) {
			$(this.master).removeClass(`hidden`);
		} else {
			$(this.master).addClass(`hidden`);
		}
	},
	
	create : function(name, cls) {
		const modal = Object.create(this);

		// Set modal's properties
		modal.name = name;
		modal.master =  `[name="${name}Modal"]`;
		modal.header =  `[name="${name}ModalHeader"]`;
		modal.content = `[name="${name}ModalContent"]`;
		
		// Add the hidden modal object to the page
		$('body').append(modal.getHTML(name, cls));
		
		// Add the modal object to fields that can receive html
		$(modal.header).data(`modal`, modal);
		$(modal.content).data(`modal`, modal);
		$(modal.content).html('legaega');
		
		
		
		// Register it
		this._modals[name] = modal;
		return modal;
	},
	
	destroy : function() {
		$(this.master).remove();
		delete this._modals[this.name];
	}
	
};