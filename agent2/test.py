from openai import OpenAI

# 初始化 client
client = OpenAI(
    api_key="sk-MPVa2BVSxfojONXeEBpaaEMWxdrQEwpO1HajB3i2NAexDxzx",    # 不是OpenAI官方key！
    base_url="https://api.chatanywhere.tech/v1"   # 注意 base_url 要改成 ChatAnywhere 的
)

# 调用GPT-4o-mini
response = client.chat.completions.create(
    model="gpt-4o-mini",   # 指定模型名称
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "你好，帮我写一段Python代码吧。"}
    ]
)

# 输出返回内容
print(response.choices[0].message.content)
