const main = () => {
  const tshirtShop = new TShirtShop()
  const shoesShop = new ShoesShop()
  const customer = new Customer()
  console.log("顾客购买以下商品：")
  customer.shopping(tshirtShop)
  customer.shopping(shoesShop)
}

interface Shop {
  sell(): string
}

class TShirtShop implements Shop {
  sell() {
    return 'T恤......'
  }
}

class ShoesShop implements Shop {
  sell() {
    return '鞋子......'
  }
}

class Customer {
  shopping(shop: Shop) {
    console.log(shop.sell())
  }
}

main()
