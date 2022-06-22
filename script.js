// Objeto global para a aplicação
const app = {
   // Propriedades do objeto no formato par 'chave: valor'

   buildBoard: () => {
      const board = document.createElement("div")
      board.style.display = "flex"
      board.style.padding = "1rem"
      board.style.gap = "1rem"
      board.style.backgroundColor = "gray"
      board.style.minidth = "1000px"
      board.style.minHeight = "500px"

      return board
   },

   buildCard: () => {

   },

   // Classes do objeto
   iniciar: function () {

      const component = document.getElementById("app")
      const board = this.buildBoard()
      component.appendChild(board)

   },

};

(() => {

   // Chamar o método do objeto global
   app.iniciar();

})();
