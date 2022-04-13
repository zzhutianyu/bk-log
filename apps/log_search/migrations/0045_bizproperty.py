# Generated by Django 3.2.5 on 2022-04-13 06:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('log_search', '0044_auto_20220329_1717'),
    ]

    operations = [
        migrations.CreateModel(
            name='BizProperty',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')),
                ('created_by', models.CharField(default='', max_length=32, verbose_name='创建者')),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True, null=True, verbose_name='更新时间')),
                ('updated_by', models.CharField(blank=True, default='', max_length=32, verbose_name='修改者')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='是否删除')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='删除时间')),
                ('deleted_by', models.CharField(blank=True, max_length=32, null=True, verbose_name='删除者')),
                ('bk_biz_id', models.IntegerField(default=None, null=True, verbose_name='业务ID')),
                ('biz_property_id', models.CharField(default='', max_length=64, null=True, verbose_name='业务属性ID')),
                ('biz_property_name', models.CharField(default='', max_length=64, null=True, verbose_name='业务属性名称')),
                ('biz_property_value', models.CharField(default='', max_length=256, null=True, verbose_name='业务属性值')),
            ],
            options={
                'verbose_name': '业务属性',
                'verbose_name_plural': '45_业务属性',
            },
        ),
    ]
