import Modal from "./modal.js";

class VendingMachine {
  constructor() {
    const vMachine = document.querySelector(".vending-machine");
    this.itemList = vMachine.querySelector(".list-item");
    this.gotList = vMachine.querySelector(".list-item-staged");
    this.txtTotal = vMachine.querySelector(".txt-total");

    const myinfo = document.querySelector(".my-info");
    this.myMoney = myinfo.querySelector(".txt-mymoney");
    this.balance = myinfo.querySelector(".txt-balance");
    this.inputCostEl = myinfo.querySelector(".inp-put");
    this.btnPut = myinfo.querySelector(".btn-put");
    this.btnReturn = myinfo.querySelector(".btn-return");
    this.btnGet = myinfo.querySelector(".btn-get");
    this.stagedList = myinfo.querySelector(".list-item-staged");
  }
  setup() {
    this.bindEvents();
  }

  // 선택한 재료 목록 생성하기
  stagedItemGenerator(target) {
    const stagedItem = document.createElement("li");
    stagedItem.dataset.item = target.dataset.item;
    stagedItem.dataset.price = target.dataset.price;
    stagedItem.innerHTML = `
          <button type="button" class="btn-staged">
            <img src="./assets/images/${target.dataset.img}" alt="" class="img-item">
            <strong class="txt-item">${target.dataset.item}</strong>
            <span class="num-counter">1</span>
          </button>
        `;
    this.stagedList.appendChild(stagedItem);
  }

  bindEvents() {
    /*
     * 1. 입금 버튼 기능
     * 입금액을 입력하고 입금 버튼을 누르면 소지금 == 소지금 - 입금액, 잔액 == 기존 잔액 + 입금액이 됩니다.
     * 입금액이 소지금 보다 많다면 실행을 중단하고 "소지금이 부족합니다." 라고 쓰인 경고창을 띄웁니다.
     * 입금액 인풋창은 초기화됩니다.
     * */

    const modal = new Modal();

    this.btnPut.addEventListener("click", (event) => {
      // function 키워드로 쓰면 아래의 this가 this.btnPut 가리킴
      if (!this.inputCostEl.value) {
        modal.createModal("입금할 금액이 없네요.", "금액을 입력해주세요!");
      }
      const inputCost = parseInt(this.inputCostEl.value);
      const myMoneyVal = parseInt(this.myMoney.textContent.replaceAll(",", "")); // 쉼표를 제거
      const balanceVal = parseInt(this.balance.textContent.replaceAll(",", ""));

      if (inputCost) {
        // 값이 있을 때만 작동하도록 하는 if문
        // 입금액이 소지금보다 적다면
        if (inputCost <= myMoneyVal && inputCost > 0) {
          this.myMoney.textContent =
            new Intl.NumberFormat().format(myMoneyVal - inputCost) + "원";
          this.balance.textContent =
            new Intl.NumberFormat().format(
              (balanceVal ? balanceVal : 0) + inputCost
            ) + " 원";
        } else {
          modal.createModal(
            "소지금이 부족해요.",
            "소지금 이하의 금액만 입금 가능합니다."
          );
          modal.removeModal();
        }
        this.inputCostEl.value = null;
      }
    });

    /*
     * 2. 거스름돈 반환 버튼 기능
     * 반환 버튼을 누르면 소지금 == 소지금 + 잔액이 됩니다.
     * 반환 버튼을 누르면 잔액 창은 초기화됩니다.
     */

    this.btnReturn.addEventListener("click", (event) => {
      if (this.balance.textContent.length === 1) {
        modal.createModal("반환할 금액이 없어요.", "돈을 입금해주세요!");
        modal.removeModal();
      }
      const balanceVal = parseInt(this.balance.textContent.replaceAll(",", ""));
      const myMoneyVal = parseInt(this.myMoney.textContent.replaceAll(",", ""));

      if (balanceVal) {
        this.myMoney.textContent =
          new Intl.NumberFormat().format(balanceVal + myMoneyVal) + " 원";
        this.balance.textContent = "원";
      }
    });

    /*
     * 3. 자판기 메뉴 기능
     * 아이템을 누르면 잔액 == 잔액 - 아이템 가격이 됩니다.
     * 아이템 가격보다 잔액이 적다면 "잔액이 부족합니다. 돈을 입금해주세요" 경고창이 나타납니다.
     * 아이템이 획득가능 창에 등록됩니다.
     * 아이템 버튼의 data-count 값이 -1 됩니다.
     * 만약 data-count 값이 0 이라면 부모 li에 sold-out 클래스를 붙여줍니다.
     */

    const btnsCola = this.itemList.querySelectorAll("button");

    btnsCola.forEach((item) => {
      item.addEventListener("click", (event) => {
        const targetEl = event.currentTarget;
        const balanceVal = parseInt(
          this.balance.textContent.replaceAll(",", "")
        );
        let isStaged = false; // 이미 선택된 상태인지 확인
        const targetElPrice = parseInt(targetEl.dataset.price); // 버튼에 data-price
        const stagedListItem = this.stagedList.querySelectorAll("li");

        // 예외처리 : 입금된 금액이 아이스크림 값보다 많거나 같을 경우
        if (balanceVal >= targetElPrice) {
          // 잔액이 아이스크림 가격보다 많거나 같으면 작동
          this.balance.textContent =
            new Intl.NumberFormat().format(balanceVal - targetElPrice) + " 원";

          // forEach 문을 사용할 경우 반복의 종료가 불가능하다(return, break 작동 안함). 모든 원소를 순환할 필요가 없다면 비효율적.
          for (const item of stagedListItem) {
            // 클릭한 아이스크림이 내가 이미 선택한 아이템인지 탐색
            if (item.dataset.item === targetEl.dataset.item) {
              //내가 클릭한 상품과 내가 담은 상품이 같을 경우
              item.querySelector(".num-counter").textContent++;
              isStaged = true;
              break;
            }
          }

          // 해당 아이템을 처음 선택했을 경우
          if (!isStaged) {
            this.stagedItemGenerator(targetEl);
          }

          // 아이스크림의 갯수를 줄입니다.
          targetEl.dataset.count--;

          if (parseInt(targetEl.dataset.count) === 0) {
            // 상품이 소진되면 품절 표시
            targetEl.parentElement.classList.add("sold-out");
            const warning = document.createElement("em");
            warning.textContent = "해당 상품은 품절입니다.";
            warning.classList.add("ir");
            // em 요소를 button 요소의 앞에 배치합니다.
            targetEl.parentElement.insertBefore(warning, targetEl);
          }
        } else {
          modal.createModal("잔액이 부족해요.", "돈을 입금해주세요!");
          modal.removeModal();
        }
      });
    });

    /**
     * 4. 획득 버튼 기능
     * 획득 버튼을 누르면 선택한 아이스크림 목록이 획득한 아이스크림 목록으로 이동합니다.
     * 획득한 아이스크림의 금액을 모두 합하여 총금액을 업데이트 합니다.
     */
    this.btnGet.addEventListener("click", (event) => {
      let isGot = false;
      let totalPrice = 0;

      if (totalPrice === 0) {
        modal.createModal("주문할 품목이 없어요.", "상품을 클릭해주세요!");
        modal.removeModal();
      }

      // 내가 고른 아이스크림 목록과 이미 구입한 목록을 비교
      for (const itemStaged of this.stagedList.querySelectorAll("li")) {
        for (const itemGot of this.gotList.querySelectorAll("li")) {
          let itemGotCount = itemGot.querySelector(".num-counter");
          // 획득할 아이템이 이미 주문한 아이스크림 리스트에 존재하는지 확인
          if (itemStaged.dataset.item === itemGot.dataset.item) {
            //획득한 아이스크림 리스트의 아이템 갯수 업데이트
            itemGotCount.textContent =
              parseInt(itemGotCount.textContent) +
              parseInt(itemStaged.querySelector(".num-counter").textContent);
            isGot = true;
            break;
          }
        }
        // 처음 주문하는 것이라면
        if (!isGot) {
          this.gotList.appendChild(itemStaged);
        }
        isGot = false;
      }

      // stagedList 목록의 내용을 초기화
      this.stagedList.innerHTML = null;

      // 획득한 아이스크림 리스트를 순환하면서 총 금액을 계산합니다.
      this.gotList.querySelectorAll("li").forEach((itemGot) => {
        totalPrice +=
          itemGot.dataset.price *
          parseInt(itemGot.querySelector(".num-counter").textContent);
      });
      this.txtTotal.textContent = `총금액 : ${new Intl.NumberFormat().format(
        totalPrice
      )}원`;
    });
  }
}

export default VendingMachine;
