#!/bin/bash

# 为所有中文文章创建英文版本
# 这样英文站点也能显示中文内容

echo "开始为中文文章创建英文版本..."

count=0

# 查找所有不以 .en.md 或 .zh-cn.md 结尾的 .md 文件
find content/post -name "*.md" -type f | while read -r file; do
    # 跳过已经是 .en.md 或 .zh-cn.md 的文件
    if [[ "$file" == *.en.md ]] || [[ "$file" == *.zh-cn.md ]]; then
        continue
    fi
    
    # 生成英文版本的文件名
    en_file="${file%.md}.en.md"
    
    # 如果英文版本不存在，则创建
    if [ ! -f "$en_file" ]; then
        cp "$file" "$en_file"
        echo "创建: $en_file"
        ((count++))
    fi
done

echo "完成！共创建了 $count 个英文版本文件"
