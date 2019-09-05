const main = () => {
    const tshirtShop = new TShirtShop();
    const shoesShop = new ShoesShop();
    const customer = new Customer();
    console.log("顾客购买以下商品：");
    customer.shopping(tshirtShop);
    customer.shopping(shoesShop);
};
class TShirtShop {
    sell() {
        return 'T恤';
    }
}
class ShoesShop {
    sell() {
        return '鞋子';
    }
}
class Customer {
    shopping(shop) {
        console.log(shop.sell());
    }
}
main();
